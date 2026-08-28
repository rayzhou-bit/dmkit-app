// readFileAsDataUri / loadImageElement / encodeToDataUri are deliberately
// NOT unit-tested here - jsdom has no real canvas 2D context. They're thin
// wrappers around FileReader/Image/canvas and are covered instead by
// manual/Playwright verification, not this suite.
import {
  computeTargetDimensions,
  validateImageFile,
  processImageFile,
} from './imageUtils';
import { IMAGE_ERRORS, MAX_SOURCE_FILE_BYTES } from '../constants/images';

describe('computeTargetDimensions', () => {
  it('scales a landscape image down to the max edge', () => {
    expect(computeTargetDimensions({ width: 2000, height: 1000, maxEdge: 1024 }))
      .toEqual({ width: 1024, height: 512 });
  });

  it('scales a portrait image down to the max edge', () => {
    expect(computeTargetDimensions({ width: 1000, height: 2000, maxEdge: 1024 }))
      .toEqual({ width: 512, height: 1024 });
  });

  it('scales a square image down to the max edge', () => {
    expect(computeTargetDimensions({ width: 2000, height: 2000, maxEdge: 1024 }))
      .toEqual({ width: 1024, height: 1024 });
  });

  it('never upscales an image already under the max edge', () => {
    expect(computeTargetDimensions({ width: 400, height: 300, maxEdge: 1024 }))
      .toEqual({ width: 400, height: 300 });
  });

  it('rounds non-integer ratios', () => {
    expect(computeTargetDimensions({ width: 1001, height: 333, maxEdge: 500 }))
      .toEqual({ width: 500, height: 166 });
  });

  it('floors degenerate 1xN dimensions at 1', () => {
    expect(computeTargetDimensions({ width: 1, height: 5000, maxEdge: 1024 }))
      .toEqual({ width: 1, height: 1024 });
  });
});

describe('validateImageFile', () => {
  it('passes an accepted MIME type within size', () => {
    expect(validateImageFile({ type: 'image/png', size: 1000 })).toBeNull();
  });

  it('rejects image/svg+xml as unsupported', () => {
    expect(validateImageFile({ type: 'image/svg+xml', size: 1000 })).toBe(IMAGE_ERRORS.unsupportedType);
  });

  it('rejects application/pdf as unsupported', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 1000 })).toBe(IMAGE_ERRORS.unsupportedType);
  });

  it('rejects an oversize file', () => {
    expect(validateImageFile({ type: 'image/png', size: MAX_SOURCE_FILE_BYTES + 1 })).toBe(IMAGE_ERRORS.tooLargeFile);
  });
});

describe('processImageFile', () => {
  const file = { name: 'photo.png', type: 'image/png', size: 1000 };
  const fakeImage = { width: 2000, height: 1000 };

  it('rejects an unsupported file before ever reading it', async () => {
    const readFile = vi.fn();
    const badFile = { name: 'x.svg', type: 'image/svg+xml', size: 1000 };
    await expect(processImageFile(badFile, { readFile })).rejects.toThrow(IMAGE_ERRORS.unsupportedType);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('rejects an oversize file before ever reading it', async () => {
    const readFile = vi.fn();
    const bigFile = { name: 'x.png', type: 'image/png', size: MAX_SOURCE_FILE_BYTES + 1 };
    await expect(processImageFile(bigFile, { readFile })).rejects.toThrow(IMAGE_ERRORS.tooLargeFile);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('succeeds on the first ladder step when encode is immediately under budget', async () => {
    const readFile = vi.fn().mockResolvedValue('data:image/png;base64,xxx');
    const loadImage = vi.fn().mockResolvedValue(fakeImage);
    const encode = vi.fn().mockReturnValue('short-result');

    const result = await processImageFile(file, { readFile, loadImage, encode });

    expect(result).toEqual({ image: 'short-result', alt: 'photo.png', width: 1024, height: 512 });
    expect(encode).toHaveBeenCalledTimes(1);
    expect(encode).toHaveBeenCalledWith(fakeImage, { width: 1024, height: 512, quality: 0.82 });
  });

  it('walks quality steps first, then drops max edge, stopping at the first under-budget result', async () => {
    const readFile = vi.fn().mockResolvedValue('data:image/png;base64,xxx');
    const loadImage = vi.fn().mockResolvedValue(fakeImage);
    // Only succeeds once maxEdge has dropped to 768 and quality to 0.62.
    const encode = vi.fn().mockImplementation((img, { width, quality }) => {
      if (width === 768 && quality <= 0.62) return 'ok';
      return 'x'.repeat(1_000_000);
    });

    const result = await processImageFile(file, { readFile, loadImage, encode });

    expect(result.image).toBe('ok');
    // 4 quality steps at 1024 (all over budget), then 3 at 768 to reach 0.62.
    expect(encode).toHaveBeenCalledTimes(7);
    expect(encode.mock.calls[0][1]).toEqual({ width: 1024, height: 512, quality: 0.82 });
    expect(encode.mock.calls[4][1]).toEqual({ width: 768, height: 384, quality: 0.82 });
    expect(encode.mock.calls[6][1]).toEqual({ width: 768, height: 384, quality: 0.62 });
  });

  it('rejects with cannotCompress when every ladder step is over budget', async () => {
    const readFile = vi.fn().mockResolvedValue('data:image/png;base64,xxx');
    const loadImage = vi.fn().mockResolvedValue(fakeImage);
    const encode = vi.fn().mockReturnValue('x'.repeat(1_000_000));

    await expect(processImageFile(file, { readFile, loadImage, encode })).rejects.toThrow(IMAGE_ERRORS.cannotCompress);
    expect(encode).toHaveBeenCalledTimes(12); // 3 maxEdge steps x 4 quality steps
  });

  it('surfaces decodeFailed when loadImage rejects', async () => {
    const readFile = vi.fn().mockResolvedValue('data:image/png;base64,xxx');
    const loadImage = vi.fn().mockRejectedValue(new Error('boom'));
    const encode = vi.fn();

    await expect(processImageFile(file, { readFile, loadImage, encode })).rejects.toThrow(IMAGE_ERRORS.decodeFailed);
    expect(encode).not.toHaveBeenCalled();
  });
});
