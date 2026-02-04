// src/lib/ui/__tests__/image.test.ts
// Tests für Image Processing Utilities

/**
 * @jest-environment jsdom
 */

import {
  readImage,
  cropAndScaleToCanvas,
  canvasToWebPBlob,
  blobToFile,
  processAvatarImage,
  calculateOptimalCrop
} from '../image';

// Mock HTMLCanvasElement.toBlob für Test-Umgebung
const mockToBlob = jest.fn();
HTMLCanvasElement.prototype.toBlob = mockToBlob;

// Mock CanvasRenderingContext2D
const mockDrawImage = jest.fn();
const mockGetContext = jest.fn(() => ({
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
  drawImage: mockDrawImage,
}));
HTMLCanvasElement.prototype.getContext = mockGetContext as any;

// Mock URL.createObjectURL und revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Image constructor
const mockImage = {
  onload: null as any,
  onerror: null as any,
  src: '',
  naturalWidth: 800,
  naturalHeight: 600,
};

global.Image = jest.fn(() => mockImage) as any;

describe('Image Processing Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToBlob.mockImplementation((callback) => {
      const mockBlob = new Blob(['mock-webp-data'], { type: 'image/webp' });
      callback(mockBlob);
    });
  });

  describe('readImage', () => {
    it('should load valid image file', async () => {
      const mockFile = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' });
      
      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const result = await readImage(mockFile);
      
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(result).toBe(mockImage);
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should reject non-image files', async () => {
      const mockFile = new File(['text-data'], 'test.txt', { type: 'text/plain' });
      
      await expect(readImage(mockFile)).rejects.toThrow('INVALID_FILE_TYPE');
    });

    it('should reject files larger than 10MB', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      await expect(readImage(largeFile)).rejects.toThrow('FILE_TOO_LARGE');
    });

    it('should handle image load errors', async () => {
      const mockFile = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' });
      
      // Simulate image load error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror();
      }, 0);

      await expect(readImage(mockFile)).rejects.toThrow('IMAGE_LOAD_FAILED');
    });
  });

  describe('cropAndScaleToCanvas', () => {
    it('should create canvas with correct dimensions', () => {
      const mockImg = { ...mockImage, naturalWidth: 800, naturalHeight: 600 } as HTMLImageElement;
      const crop = { x: 100, y: 50, size: 400 };
      
      const canvas = cropAndScaleToCanvas(mockImg, crop, 1024);
      
      expect(canvas.width).toBe(400); // No scaling needed (400 < 1024)
      expect(canvas.height).toBe(400);
      expect(mockDrawImage).toHaveBeenCalledWith(
        mockImg,
        100, 50, 400, 400, // source rect
        0, 0, 400, 400      // dest rect
      );
    });

    it('should scale down large crops', () => {
      const mockImg = { ...mockImage, naturalWidth: 2000, naturalHeight: 2000 } as HTMLImageElement;
      const crop = { x: 0, y: 0, size: 1600 };
      
      const canvas = cropAndScaleToCanvas(mockImg, crop, 1024);
      
      expect(canvas.width).toBe(1024); // Scaled down
      expect(canvas.height).toBe(1024);
      expect(mockDrawImage).toHaveBeenCalledWith(
        mockImg,
        0, 0, 1600, 1600,    // source rect
        0, 0, 1024, 1024     // dest rect (scaled)
      );
    });

    it('should not upscale small images', () => {
      const mockImg = { ...mockImage, naturalWidth: 400, naturalHeight: 400 } as HTMLImageElement;
      const crop = { x: 0, y: 0, size: 300 };
      
      const canvas = cropAndScaleToCanvas(mockImg, crop, 1024);
      
      expect(canvas.width).toBe(300); // No upscaling
      expect(canvas.height).toBe(300);
    });

    it('should throw error if canvas context fails', () => {
      mockGetContext.mockReturnValueOnce(null);
      
      const mockImg = { ...mockImage } as HTMLImageElement;
      const crop = { x: 0, y: 0, size: 100 };
      
      expect(() => cropAndScaleToCanvas(mockImg, crop)).toThrow('CANVAS_CONTEXT_FAILED');
    });
  });

  describe('canvasToWebPBlob', () => {
    it('should convert canvas to WebP blob', async () => {
      const mockCanvas = document.createElement('canvas');
      
      const blob = await canvasToWebPBlob(mockCanvas, 0.8);
      
      expect(mockToBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.8
      );
      expect(blob.type).toBe('image/webp');
    });

    it('should handle toBlob not supported', async () => {
      const mockCanvas = { toBlob: undefined } as any;
      
      await expect(canvasToWebPBlob(mockCanvas)).rejects.toThrow('CANVAS_TO_BLOB_UNSUPPORTED');
    });

    it('should handle toBlob returning null', async () => {
      mockToBlob.mockImplementation((callback) => callback(null));
      const mockCanvas = document.createElement('canvas');
      
      await expect(canvasToWebPBlob(mockCanvas)).rejects.toThrow('CANVAS_TO_BLOB_FAILED');
    });
  });

  describe('blobToFile', () => {
    it('should create File from Blob with correct properties', () => {
      const mockBlob = new Blob(['webp-data'], { type: 'image/webp' });
      
      const file = blobToFile(mockBlob, 'avatar.webp');
      
      expect(file.name).toBe('avatar.webp');
      expect(file.type).toBe('image/webp');
      expect(file.size).toBe(mockBlob.size);
    });

    it('should use default name if not provided', () => {
      const mockBlob = new Blob(['webp-data'], { type: 'image/webp' });
      
      const file = blobToFile(mockBlob);
      
      expect(file.name).toBe('avatar.webp');
    });
  });

  describe('calculateOptimalCrop', () => {
    it('should center crop for landscape image', () => {
      const crop = calculateOptimalCrop(800, 600);
      
      expect(crop).toEqual({
        x: 100,  // (800 - 600) / 2
        y: 0,
        size: 600 // min(800, 600)
      });
    });

    it('should center crop for portrait image', () => {
      const crop = calculateOptimalCrop(600, 800);
      
      expect(crop).toEqual({
        x: 0,
        y: 100,  // (800 - 600) / 2
        size: 600 // min(600, 800)
      });
    });

    it('should handle square image', () => {
      const crop = calculateOptimalCrop(500, 500);
      
      expect(crop).toEqual({
        x: 0,
        y: 0,
        size: 500
      });
    });
  });

  describe('processAvatarImage', () => {
    it('should process image through complete pipeline', async () => {
      const mockFile = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' });
      const crop = { x: 0, y: 0, size: 400 };
      
      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const result = await processAvatarImage(mockFile, crop, 1024, 0.8);
      
      expect(result.name).toBe('avatar.webp');
      expect(result.type).toBe('image/webp');
    });

    it('should handle processing errors', async () => {
      const mockFile = new File(['bad-data'], 'test.jpg', { type: 'image/jpeg' });
      const crop = { x: 0, y: 0, size: 400 };
      
      // Simulate image load error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror();
      }, 0);

      await expect(processAvatarImage(mockFile, crop)).rejects.toThrow();
    });
  });
});
