// src/lib/ui/image.ts
// Zweck: Framework-freie Image-Processing Utilities für Avatar-Upload
// WebP-Konvertierung, 1:1-Crop, Skalierung auf max 1024px

export type CropRect = {
  x: number;
  y: number;
  size: number; // Quadratischer Crop
};

/**
 * Lädt ein File als HTMLImageElement
 */
export async function readImage(file: File): Promise<HTMLImageElement> {
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_FILE_TYPE');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('FILE_TOO_LARGE');
  }

  const url = URL.createObjectURL(file);
  
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Croppt und skaliert ein Bild auf Canvas
 * @param img - Quellbild
 * @param crop - Crop-Koordinaten im Pixelkoordinatensystem des Bildes
 * @param targetMax - Maximale Kantenlänge (default: 1024)
 */
export function cropAndScaleToCanvas(
  img: HTMLImageElement,
  crop: CropRect,
  targetMax = 1024
): HTMLCanvasElement {
  const { x, y, size } = crop;
  
  // Keine Upscaling - wenn Crop kleiner als targetMax, behalten wir die Originalgröße
  const scale = Math.min(1, targetMax / size);
  const outputSize = Math.round(size * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('CANVAS_CONTEXT_FAILED');
  }

  // High-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw cropped and scaled image
  ctx.drawImage(
    img,
    x, y, size, size,  // source rect (square crop)
    0, 0, outputSize, outputSize  // dest rect (scaled square)
  );

  return canvas;
}

/**
 * Konvertiert Canvas zu WebP Blob
 * @param canvas - Canvas Element
 * @param quality - WebP Qualität (0.0 - 1.0, default: 0.8)
 */
export function canvasToWebPBlob(
  canvas: HTMLCanvasElement, 
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!canvas.toBlob) {
      reject(new Error('CANVAS_TO_BLOB_UNSUPPORTED'));
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('CANVAS_TO_BLOB_FAILED'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Konvertiert Blob zu File mit korrektem Namen und Type
 */
export function blobToFile(blob: Blob, name = 'avatar.webp'): File {
  return new File([blob], name, { 
    type: 'image/webp',
    lastModified: Date.now()
  });
}

/**
 * Vollständiger Avatar-Processing Pipeline
 * @param file - Input File (JPEG/PNG/WebP)
 * @param crop - Crop-Koordinaten
 * @param maxSizePx - Maximale Ausgabegröße (default: 1024)
 * @param quality - WebP Qualität (default: 0.8)
 */
export async function processAvatarImage(
  file: File,
  crop: CropRect,
  maxSizePx = 1024,
  quality = 0.8
): Promise<File> {
  try {
    const img = await readImage(file);
    const canvas = cropAndScaleToCanvas(img, crop, maxSizePx);
    const blob = await canvasToWebPBlob(canvas, quality);
    return blobToFile(blob, 'avatar.webp');
  } catch (error) {
    // Re-throw mit einheitlichen Error-Codes
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('UNKNOWN_PROCESSING_ERROR');
  }
}

/**
 * Berechnet optimale Crop-Größe für 1:1 Aspect Ratio
 */
export function calculateOptimalCrop(
  imageWidth: number,
  imageHeight: number
): CropRect {
  const size = Math.min(imageWidth, imageHeight);
  const x = (imageWidth - size) / 2;
  const y = (imageHeight - size) / 2;
  
  return { x, y, size };
}
