export const GRID_SIZE = 12; // px

export const CANVAS_SIZE = {
  width: 250 * GRID_SIZE,
  height: 200 * GRID_SIZE,
};
export const DEFAULT_CANVAS_POSITION = {
  x: 80,
  y: 50,
};

export const DEFAULT_CANVAS_SCALE = 1;
export const MAX_CANVAS_SCALE = 3;
export const MIN_CANVAS_SCALE = 0.5;

// Minimum px of canvas content that must stay reachable in the viewport
// when panning, so you can never scroll the whole board out of view.
export const PAN_BOUNDS_MARGIN = 200;

export const DEFAULT_CARD_POSITION = {
  x: 10 * GRID_SIZE,
  y: 7 * GRID_SIZE,
};
export const DEFAULT_CARD_OFFSET = 3 * GRID_SIZE;
export const DEFAULT_CARD_SIZE = {
  width: 20 * GRID_SIZE,
  height: 20 * GRID_SIZE,
};
export const MIN_CARD_SIZE = {
  width: 12 * GRID_SIZE,
  height: 10 * GRID_SIZE,
};
// Width both Attributes/Combat need collapsed to strips - Card.scss's
// .monster-content padding(8*2) + gaps(8*2) + media(108) + two 24px strips =
// 188px, grid-snapped up (never down, or content clips) to 192px. The hard
// resize floor (react-rnd's minWidth, see useCardHooks) - Media's
// minmax(108px, 1fr) column absorbs any width above this.
export const MONSTER_MIN_CARD_SIZE = {
  width: 16 * GRID_SIZE,
  height: MIN_CARD_SIZE.height,
};
// Default/created size - 1.5x the min width, giving Media some breathing
// room from the start instead of sitting at its bare floor.
export const MONSTER_CARD_SIZE = {
  width: 1.5 * MONSTER_MIN_CARD_SIZE.width,
  height: 36 * GRID_SIZE,
};

export const ZOOM_STEP = 0.1;                 // additive step, buttons + keyboard
export const WHEEL_ZOOM_SENSITIVITY = 0.0025; // exponent per normalized px
export const WHEEL_PAN_SPEED = 1;             // multiplier on normalized px
export const WHEEL_LINE_HEIGHT = 16;          // px per DOM_DELTA_LINE unit
export const WHEEL_PAGE_HEIGHT = 400;         // fallback px per DOM_DELTA_PAGE unit
export const MAX_WHEEL_DELTA = 50;            // per-event clamp, normalized px
export const WHEEL_GESTURE_END_MS = 160;      // idle before committing a wheel gesture
export const CANVAS_TRANSITION_MS = 300;      // replaces the hardcoded `transform 0.3s`
