/**
 * PNG Export Types
 * Types for the chunked PNG export functionality
 */

export type ExportPhase =
  | 'preparing'
  | 'rendering'
  | 'encoding'
  | 'complete'
  | 'error'

export interface ExportOptions {
  /** Target scale factor (default 4 for high quality) */
  scaleFactor: number
  /** Padding around the diagram in pixels */
  padding: number
  /** Whether to include the grid in the export */
  includeGrid: boolean
  /** Grid size in pixels */
  gridSize: number
  /** Background color for the export */
  backgroundColor: string
  /** Grid line color */
  gridColor: string
}

export interface ExportProgress {
  /** Current phase of the export process */
  phase: ExportPhase
  /** Current tile being processed (1-indexed) */
  currentTile: number
  /** Total number of tiles to process */
  totalTiles: number
  /** Overall progress percentage (0-100) */
  percentage: number
  /** Human-readable status message */
  message: string
}

export interface ExportResult {
  /** The exported PNG as a Blob */
  blob: Blob
  /** Final image width in pixels */
  width: number
  /** Final image height in pixels */
  height: number
  /** Number of tiles used in the export */
  tileCount: number
  /** Export duration in milliseconds */
  exportTime: number
}

export type ProgressCallback = (progress: ExportProgress) => void

export interface ExportError {
  code: 'SIZE_EXCEEDED' | 'MEMORY_ERROR' | 'ENCODING_ERROR' | 'CANVAS_ERROR' | 'SVG_ERROR'
  message: string
  details?: unknown
}
