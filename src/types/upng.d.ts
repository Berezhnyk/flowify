/**
 * Type declarations for upng-js
 * A lightweight PNG encoder/decoder
 */

declare module 'upng-js' {
  export interface UPNGImage {
    /** Image width in pixels */
    width: number
    /** Image height in pixels */
    height: number
    /** Bit depth (1, 2, 4, 8, 16) */
    depth: number
    /** Color type (0=grayscale, 2=RGB, 3=indexed, 4=grayscale+alpha, 6=RGBA) */
    ctype: number
    /** Array of frame buffers (for animated PNGs) */
    frames: ArrayBuffer[]
    /** Additional PNG chunks/metadata */
    tabs: Record<string, unknown>
  }

  /**
   * Decode a PNG buffer to an image object
   * @param buffer - ArrayBuffer containing PNG data
   * @returns Decoded image object
   */
  export function decode(buffer: ArrayBuffer): UPNGImage

  /**
   * Encode RGBA pixel data to PNG
   * @param imgs - Array of ArrayBuffers containing RGBA pixel data
   * @param w - Image width in pixels
   * @param h - Image height in pixels
   * @param cnum - Color count: 0 for lossless, 256 for lossy (indexed)
   * @param dels - Frame delays for animated PNGs (optional)
   * @returns ArrayBuffer containing encoded PNG data
   */
  export function encode(
    imgs: ArrayBuffer[],
    w: number,
    h: number,
    cnum: number,
    dels?: number[]
  ): ArrayBuffer

  /**
   * Convert decoded image frames to RGBA8 format
   * @param img - Decoded image object
   * @returns Array of RGBA8 ArrayBuffers
   */
  export function toRGBA8(img: UPNGImage): ArrayBuffer[]
}
