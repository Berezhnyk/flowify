/**
 * Chunked PNG Export Service
 *
 * Exports large diagrams as high-quality PNGs by rendering in tiles
 * to bypass browser canvas size limits, then stitching them together.
 */

import UPNG from 'upng-js'
import type { ExportOptions, ExportProgress, ExportResult, ProgressCallback } from '@/types/export'

// Constants for safe canvas limits
const SAFE_TILE_SIZE = 4096 // Conservative for Safari compatibility
const MAX_EXPORT_DIMENSION = 65536 // 64K pixels max dimension
const MAX_EXPORT_PIXELS = 500_000_000 // 500M pixels max (~500MB memory)
export const CLIPBOARD_SIZE_LIMIT = 16 * 1024 * 1024 // 16MB

interface Tile {
  index: number
  x: number // X position in final image
  y: number // Y position in final image
  width: number // Tile width
  height: number // Tile height
}

interface SvgDimensions {
  width: number
  height: number
  viewBoxX: number
  viewBoxY: number
}

/**
 * Get the dimensions of an SVG element, including viewBox offsets
 */
function getSvgDimensions(svgElement: SVGSVGElement, zoomLevel: number = 1): SvgDimensions {
  // Try to get dimensions from viewBox first
  const viewBox = svgElement.viewBox.baseVal
  if (viewBox.width > 0 && viewBox.height > 0) {
    return {
      width: viewBox.width,
      height: viewBox.height,
      viewBoxX: viewBox.x,
      viewBoxY: viewBox.y,
    }
  }

  // Fallback: use bounding box divided by zoom level
  const bbox = svgElement.getBoundingClientRect()
  return {
    width: bbox.width / zoomLevel,
    height: bbox.height / zoomLevel,
    viewBoxX: 0,
    viewBoxY: 0,
  }
}

/**
 * Calculate the optimal scale factor that fits within limits
 */
function calculateOptimalScaleFactor(
  svgWidth: number,
  svgHeight: number,
  padding: number,
  preferredScale: number
): number {
  let scaleFactor = preferredScale

  // Try to find a scale factor that fits within limits
  while (scaleFactor >= 0.5) {
    const width = svgWidth * scaleFactor + padding * 2
    const height = svgHeight * scaleFactor + padding * 2
    const totalPixels = width * height

    if (
      width <= MAX_EXPORT_DIMENSION &&
      height <= MAX_EXPORT_DIMENSION &&
      totalPixels <= MAX_EXPORT_PIXELS
    ) {
      return scaleFactor
    }

    scaleFactor -= 0.5
  }

  // If still too large, calculate exact maximum scale
  const maxScaleByWidth = (MAX_EXPORT_DIMENSION - padding * 2) / svgWidth
  const maxScaleByHeight = (MAX_EXPORT_DIMENSION - padding * 2) / svgHeight
  const maxScaleByPixels = Math.sqrt(
    MAX_EXPORT_PIXELS / ((svgWidth + padding * 2 / preferredScale) * (svgHeight + padding * 2 / preferredScale))
  )

  scaleFactor = Math.min(maxScaleByWidth, maxScaleByHeight, maxScaleByPixels)

  // Ensure minimum scale of 0.25 for readability
  return Math.max(0.25, scaleFactor)
}

/**
 * Calculate the tile grid for a given image size
 */
function calculateTileGrid(totalWidth: number, totalHeight: number): Tile[] {
  const tiles: Tile[] = []
  const cols = Math.ceil(totalWidth / SAFE_TILE_SIZE)
  const rows = Math.ceil(totalHeight / SAFE_TILE_SIZE)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * SAFE_TILE_SIZE
      const y = row * SAFE_TILE_SIZE
      tiles.push({
        index: tiles.length,
        x,
        y,
        width: Math.min(SAFE_TILE_SIZE, totalWidth - x),
        height: Math.min(SAFE_TILE_SIZE, totalHeight - y),
      })
    }
  }

  return tiles
}

/**
 * Inline computed styles from original element to cloned element
 */
function inlineStyles(originalEl: Element, clonedEl: Element): void {
  const originalChildren = originalEl.children
  const clonedChildren = clonedEl.children

  // Get computed style and inline important properties
  const computedStyle = window.getComputedStyle(originalEl)

  // Comprehensive list of SVG style properties
  const styleProps = [
    // Colors and fills
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-opacity',
    'stroke-width',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    // Text
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'text-anchor',
    'dominant-baseline',
    'alignment-baseline',
    'letter-spacing',
    // General
    'color',
    'opacity',
    'visibility',
    'display',
    // Background (for foreignObject content)
    'background',
    'background-color',
  ]

  if (clonedEl instanceof SVGElement || clonedEl instanceof HTMLElement) {
    const clonedStyle = (clonedEl as SVGElement | HTMLElement).style

    styleProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop)
      if (value && value !== '' && value !== 'none' && value !== 'normal') {
        clonedStyle.setProperty(prop, value)
      }
    })

    // Special handling for rect, path, circle, ellipse - ensure fill is visible
    const tagName = originalEl.tagName.toLowerCase()
    if (['rect', 'path', 'circle', 'ellipse', 'polygon', 'polyline'].includes(tagName)) {
      const fill = computedStyle.getPropertyValue('fill')
      // If fill is a CSS variable or empty, try to get from attribute
      if (!fill || fill === 'none' || fill.includes('var(')) {
        const attrFill = originalEl.getAttribute('fill')
        if (attrFill && attrFill !== 'none') {
          clonedStyle.fill = attrFill
        }
      }
    }

    // Special handling for text elements - ensure fill is set for text color
    if (tagName === 'text' || tagName === 'tspan') {
      const textColor =
        computedStyle.getPropertyValue('fill') || computedStyle.getPropertyValue('color')
      if (textColor && textColor !== 'none' && !textColor.includes('var(')) {
        clonedStyle.fill = textColor
      } else {
        // Fallback: check attribute
        const attrFill = originalEl.getAttribute('fill')
        if (attrFill) {
          clonedStyle.fill = attrFill
        }
      }
    }

    // Handle marker references (arrows in diagrams)
    const markerEnd = originalEl.getAttribute('marker-end')
    const markerStart = originalEl.getAttribute('marker-start')
    if (markerEnd) {
      clonedEl.setAttribute('marker-end', markerEnd)
    }
    if (markerStart) {
      clonedEl.setAttribute('marker-start', markerStart)
    }
  }

  // Recursively process children
  for (let i = 0; i < originalChildren.length; i++) {
    const originalChild = originalChildren[i]
    const clonedChild = clonedChildren[i]
    if (originalChild && clonedChild) {
      inlineStyles(originalChild, clonedChild)
    }
  }
}

/**
 * Prepare SVG for export by cloning and inlining all styles
 */
function prepareSvgForExport(
  svgElement: SVGSVGElement,
  scaleFactor: number
): { svgClone: SVGSVGElement; dimensions: SvgDimensions } {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement

  // Inline computed styles
  inlineStyles(svgElement, svgClone)

  // Copy any <style> or <defs> elements that contain gradients, patterns, markers
  const originalDefs = svgElement.querySelectorAll('defs, style')
  originalDefs.forEach((def) => {
    const clonedDef = def.cloneNode(true)
    svgClone.insertBefore(clonedDef, svgClone.firstChild)
  })

  // Resolve CSS variables in any inline <style> elements
  const styleElements = svgClone.querySelectorAll('style')
  styleElements.forEach((styleEl) => {
    let cssText = styleEl.textContent || ''
    // Replace CSS variables with their computed values
    const varRegex = /var\(--([^)]+)\)/g
    cssText = cssText.replace(varRegex, (match, varName) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${varName}`)
        .trim()
      return value || match
    })
    styleEl.textContent = cssText
  })

  // Get dimensions (including viewBox offsets for diagrams with negative origins)
  const dimensions = getSvgDimensions(svgElement)

  // Preserve original viewBox (important for gitGraph and other diagrams with negative origins)
  svgClone.setAttribute(
    'viewBox',
    `${dimensions.viewBoxX} ${dimensions.viewBoxY} ${dimensions.width} ${dimensions.height}`
  )
  svgClone.setAttribute('width', (dimensions.width * scaleFactor).toString())
  svgClone.setAttribute('height', (dimensions.height * scaleFactor).toString())
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgClone.style.shapeRendering = 'geometricPrecision'
  svgClone.style.textRendering = 'geometricPrecision'

  return { svgClone, dimensions }
}

/**
 * Convert SVG element to data URL
 */
function svgToDataUrl(svgClone: SVGSVGElement): string {
  const svgData = new XMLSerializer().serializeToString(svgClone)
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

/**
 * Load an image from a data URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`))
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

/**
 * Draw grid lines on a canvas for a specific tile region
 */
function drawGridForTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  options: ExportOptions,
  scaleFactor: number
): void {
  const gridSize = options.gridSize * scaleFactor
  ctx.strokeStyle = options.gridColor
  ctx.lineWidth = Math.max(1, scaleFactor / 2)

  // Calculate grid offset for this tile
  const startX = (Math.floor(tile.x / gridSize) * gridSize) - tile.x
  const startY = (Math.floor(tile.y / gridSize) * gridSize) - tile.y

  // Draw vertical lines
  for (let x = startX; x < tile.width; x += gridSize) {
    if (x >= 0) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, tile.height)
      ctx.stroke()
    }
  }

  // Draw horizontal lines
  for (let y = startY; y < tile.height; y += gridSize) {
    if (y >= 0) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(tile.width, y + 0.5)
      ctx.stroke()
    }
  }
}

/**
 * Render a single tile of the diagram
 */
function renderTile(
  tile: Tile,
  svgImage: HTMLImageElement,
  options: ExportOptions,
  scaleFactor: number,
  svgDimensions: SvgDimensions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = tile.width
  canvas.height = tile.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to create canvas context')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Fill background for this tile section
  ctx.fillStyle = options.backgroundColor
  ctx.fillRect(0, 0, tile.width, tile.height)

  // Draw grid if enabled
  if (options.includeGrid) {
    drawGridForTile(ctx, tile, options, scaleFactor)
  }

  // Calculate the SVG image dimensions
  const imgWidth = svgDimensions.width * scaleFactor
  const imgHeight = svgDimensions.height * scaleFactor

  // Draw the portion of the SVG visible in this tile
  // The SVG is positioned with padding offset
  ctx.drawImage(
    svgImage,
    tile.x - options.padding, // Source X in image
    tile.y - options.padding, // Source Y in image
    tile.width, // Source width
    tile.height, // Source height
    0, // Dest X
    0, // Dest Y
    tile.width, // Dest width
    tile.height // Dest height
  )

  return canvas
}

/**
 * Copy pixel data from a tile canvas to the target buffer
 */
function copyTilePixels(
  tileCanvas: HTMLCanvasElement,
  targetBuffer: Uint8Array,
  tile: Tile,
  totalWidth: number
): void {
  const ctx = tileCanvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const imageData = ctx.getImageData(0, 0, tile.width, tile.height)
  const tilePixels = imageData.data

  // Copy row by row to correct position in target buffer
  for (let row = 0; row < tile.height; row++) {
    const targetRowStart = ((tile.y + row) * totalWidth + tile.x) * 4
    const sourceRowStart = row * tile.width * 4

    targetBuffer.set(tilePixels.subarray(sourceRowStart, sourceRowStart + tile.width * 4), targetRowStart)
  }
}

/**
 * Check if chunked export is needed based on dimensions
 */
export function needsChunkedExport(width: number, height: number): boolean {
  const MAX_SINGLE_CANVAS = 8192 // Conservative limit
  const MAX_SINGLE_PIXELS = 67_108_864 // 64M pixels
  return width > MAX_SINGLE_CANVAS || height > MAX_SINGLE_CANVAS || width * height > MAX_SINGLE_PIXELS
}

/**
 * Export a diagram as a high-quality PNG using chunked rendering
 */
export async function exportChunkedPng(
  svgElement: SVGSVGElement,
  options: ExportOptions,
  onProgress?: ProgressCallback
): Promise<ExportResult> {
  const startTime = performance.now()

  // Phase: Preparing
  onProgress?.({
    phase: 'preparing',
    currentTile: 0,
    totalTiles: 0,
    percentage: 0,
    message: 'Preparing diagram for export...',
  })

  // Get SVG dimensions first to calculate optimal scale
  const rawDimensions = getSvgDimensions(svgElement)

  // Calculate optimal scale factor that fits within memory limits
  const actualScaleFactor = calculateOptimalScaleFactor(
    rawDimensions.width,
    rawDimensions.height,
    options.padding,
    options.scaleFactor
  )


  // Prepare SVG with the actual scale factor
  const { svgClone, dimensions: svgDimensions } = prepareSvgForExport(svgElement, actualScaleFactor)

  // Calculate final dimensions with actual scale factor
  const finalWidth = Math.ceil(svgDimensions.width * actualScaleFactor + options.padding * 2)
  const finalHeight = Math.ceil(svgDimensions.height * actualScaleFactor + options.padding * 2)

  // Calculate tile grid
  const tiles = calculateTileGrid(finalWidth, finalHeight)
  const totalTiles = tiles.length

  // Convert SVG to data URL and load as image
  const svgDataUrl = svgToDataUrl(svgClone)
  const svgImage = await loadImage(svgDataUrl)

  // Allocate pixel buffer for the full image
  const pixelData = new Uint8Array(finalWidth * finalHeight * 4)

  // Phase: Rendering tiles
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]!

    onProgress?.({
      phase: 'rendering',
      currentTile: i + 1,
      totalTiles,
      percentage: Math.round(((i + 1) / totalTiles) * 80), // Rendering is 80% of work
      message: `Rendering tile ${i + 1} of ${totalTiles}...`,
    })

    // Render tile to canvas
    const tileCanvas = renderTile(tile, svgImage, options, actualScaleFactor, svgDimensions)

    // Extract pixel data and copy to correct position
    copyTilePixels(tileCanvas, pixelData, tile, finalWidth)

    // Allow GC to reclaim tile canvas
    tileCanvas.width = 0
    tileCanvas.height = 0

    // Yield to allow UI updates
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  // Phase: Encoding PNG
  onProgress?.({
    phase: 'encoding',
    currentTile: totalTiles,
    totalTiles,
    percentage: 85,
    message: 'Encoding PNG...',
  })

  // Encode final PNG using UPNG.js
  const pngData = UPNG.encode([pixelData.buffer], finalWidth, finalHeight, 0) // 0 = lossless

  // Create blob
  const blob = new Blob([pngData], { type: 'image/png' })

  const exportTime = performance.now() - startTime

  // Phase: Complete
  onProgress?.({
    phase: 'complete',
    currentTile: totalTiles,
    totalTiles,
    percentage: 100,
    message: `Export complete in ${Math.round(exportTime)}ms`,
  })

  return {
    blob,
    width: finalWidth,
    height: finalHeight,
    tileCount: totalTiles,
    exportTime,
  }
}

/**
 * Get default export options
 */
export function getDefaultExportOptions(): ExportOptions {
  return {
    scaleFactor: 4,
    padding: 60,
    includeGrid: false,
    gridSize: 20,
    backgroundColor: '#ffffff',
    gridColor: 'rgba(0, 0, 0, 0.1)',
  }
}
