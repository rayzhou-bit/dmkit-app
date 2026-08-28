// Firestore caps a document at 1 MiB; a base64 data URI costs ~1 byte/char.
// Budget leaves headroom for title/views/type/overhead on the card doc.
export const MAX_IMAGE_DATA_URI_LENGTH = 700_000;

// Pre-decode guard so a huge source file isn't even read before rejecting.
export const MAX_SOURCE_FILE_BYTES = 20 * 1024 * 1024;

export const IMAGE_OUTPUT_MIME = 'image/jpeg';
export const IMAGE_MAX_EDGE_STEPS = [1024, 768, 512];
export const IMAGE_QUALITY_STEPS = [0.82, 0.72, 0.62, 0.5];

// SVG deliberately excluded: zero intrinsic dimensions rasterize unpredictably.
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];

export const IMAGE_ERRORS = {
  tooLargeFile: 'That file is too large — please use an image under 20 MB.',
  unsupportedType: 'That file type isn\'t supported. Use PNG, JPEG, WebP, GIF, or BMP.',
  decodeFailed: 'Could not read that image — the file may be corrupt.',
  cannotCompress: 'This image can\'t be compressed small enough to save. Try a smaller image.',
};
