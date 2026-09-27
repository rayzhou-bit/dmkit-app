import {
  MIN_CANVAS_SCALE,
  MAX_CANVAS_SCALE,
  WHEEL_ZOOM_SENSITIVITY,
  WHEEL_LINE_HEIGHT,
  WHEEL_PAGE_HEIGHT,
  MAX_WHEEL_DELTA,
  CANVAS_TRANSITION_MS,
  PAN_BOUNDS_MARGIN,
} from '../constants/dimensions';

export const clampScale = (scale) => Math.max(MIN_CANVAS_SCALE, Math.min(MAX_CANVAS_SCALE, scale));

export const roundScale = (scale) => Math.round(scale * 100) / 100;

export const getViewportPoint = (event, element) => {
  if (!element) return { x: 0, y: 0 };
  const rect = element.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

export const normalizeWheelDelta = (event, viewportHeight) => {
  const factor = event.deltaMode === 1 ? WHEEL_LINE_HEIGHT
    : event.deltaMode === 2 ? (viewportHeight || WHEEL_PAGE_HEIGHT)
    : 1;
  const clamp = (v) => Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, v * factor));
  return { dx: clamp(event.deltaX), dy: clamp(event.deltaY) };
};

export const zoomAtPoint = ({ position, scale, nextScale, anchor }) => {
  const s2 = clampScale(roundScale(nextScale));
  if (s2 === scale) return { position, scale };
  const x2 = anchor.x - (anchor.x - position.x) * (s2 / scale);
  const y2 = anchor.y - (anchor.y - position.y) * (s2 / scale);
  return { position: { x: x2, y: y2 }, scale: s2 };
};

export const getWheelScale = (scale, dy) => clampScale(roundScale(scale * Math.exp(-dy * WHEEL_ZOOM_SENSITIVITY)));

// Persisted card size is a plain number until a real react-rnd drag turns it
// into a "Npx" string (see Canvas/hooks.js's sizeToNumber) - coerce here too
// so this stays correct called either directly or already-coerced.
const sizeToNumber = (value) => typeof value === 'string' ? parseFloat(value) : value;

// Pan position that puts a card's center at the viewport's center, at the
// current scale. An unmeasured (0x0) viewport isn't special-cased - it just
// falls out as "card center at the origin", and clampPosition is itself a
// no-op at that size, so the result is harmless rather than correct.
export const getCenteredPosition = ({ cardPos, cardSize, viewportWidth, viewportHeight, scale }) => {
  const cx = cardPos.x + sizeToNumber(cardSize.width) / 2;
  const cy = cardPos.y + sizeToNumber(cardSize.height) / 2;
  return {
    x: viewportWidth / 2 - cx * scale,
    y: viewportHeight / 2 - cy * scale,
  };
};

export const applyTransform = (node, { position, scale, animate }) => {
  if (!node) return;
  node.style.transition = animate ? `transform ${CANVAS_TRANSITION_MS}ms ease` : 'none';
  node.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
};

export const formatZoomPercent = (scale) => `${Math.round(scale * 100)}%`;

// Keeps at least PAN_BOUNDS_MARGIN px of canvas content reachable inside the
// viewport, so panning/zooming can never lose the whole board off-screen.
// Degenerate (0-size) viewport just falls through to the viewport edge -
// harmless, since nothing is visibly rendered at that size anyway.
export const clampPosition = ({ position, scale, viewportWidth, viewportHeight, contentWidth, contentHeight, margin = PAN_BOUNDS_MARGIN }) => {
  // Not yet measured (e.g. before first layout) - clamping against a
  // degenerate viewport would force the position into a meaningless corner.
  if (viewportWidth <= 0 || viewportHeight <= 0) return position;
  const contentW = contentWidth * scale;
  const contentH = contentHeight * scale;
  const minX = margin - contentW;
  const maxX = viewportWidth - margin;
  const minY = margin - contentH;
  const maxY = viewportHeight - margin;
  return {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
  };
};
