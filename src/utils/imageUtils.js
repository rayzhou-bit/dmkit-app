import {
  MAX_IMAGE_DATA_URI_LENGTH,
  MAX_SOURCE_FILE_BYTES,
  IMAGE_OUTPUT_MIME,
  IMAGE_MAX_EDGE_STEPS,
  IMAGE_QUALITY_STEPS,
  ACCEPTED_IMAGE_TYPES,
  IMAGE_ERRORS,
} from '../constants/images';

// Pure functions - fully unit-testable in jsdom, no canvas/DOM needed.

// Preserves aspect ratio, scales only the longest edge, never upscales.
export const computeTargetDimensions = ({ width, height, maxEdge }) => {
  const longestEdge = Math.max(width, height);
  const scale = longestEdge <= maxEdge ? 1 : maxEdge / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

export const isWithinBudget = (dataUri) => dataUri.length <= MAX_IMAGE_DATA_URI_LENGTH;

export const validateImageFile = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file?.type)) return IMAGE_ERRORS.unsupportedType;
  if ((file?.size ?? 0) > MAX_SOURCE_FILE_BYTES) return IMAGE_ERRORS.tooLargeFile;
  return null;
};

// Real-DOM wrappers - thin, deliberately untested at unit level (no canvas
// 2D context in jsdom); covered by manual/Playwright verification instead.

export const readFileAsDataUri = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.onabort = () => reject(new Error('File read aborted'));
  reader.readAsDataURL(file);
});

export const loadImageElement = (dataUri) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Image failed to decode'));
  img.src = dataUri;
});

export const encodeToDataUri = (imageEl, { width, height, quality }) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // Flatten transparency to white rather than JPEG's default black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(imageEl, 0, 0, width, height);
  return canvas.toDataURL(IMAGE_OUTPUT_MIME, quality);
};

// Orchestrator - deps injected so the compression ladder is testable
// without a real canvas 2D context.
export const processImageFile = async (file, deps = {}) => {
  const {
    readFile = readFileAsDataUri,
    loadImage = loadImageElement,
    encode = encodeToDataUri,
  } = deps;

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  let imageEl;
  try {
    const dataUri = await readFile(file);
    imageEl = await loadImage(dataUri);
  } catch (err) {
    throw new Error(IMAGE_ERRORS.decodeFailed);
  }

  for (const maxEdge of IMAGE_MAX_EDGE_STEPS) {
    const { width, height } = computeTargetDimensions({
      width: imageEl.width,
      height: imageEl.height,
      maxEdge,
    });
    for (const quality of IMAGE_QUALITY_STEPS) {
      const encoded = await encode(imageEl, { width, height, quality });
      if (isWithinBudget(encoded)) {
        return { image: encoded, alt: file.name, width, height };
      }
    }
  }

  throw new Error(IMAGE_ERRORS.cannotCompress);
};
