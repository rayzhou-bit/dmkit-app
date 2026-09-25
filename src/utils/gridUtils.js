import { GRID_SIZE, CANVAS_SIZE, DEFAULT_CARD_POSITION, DEFAULT_CARD_SIZE, GROUP_LAYOUT_GAP } from '../constants/dimensions';

// size.width/height is a plain number for a never-manually-resized card, or
// a "Npx" string after a real resize drag (see project/reducers.js's
// applyCardSize) - mirrors Canvas/hooks.js's own (unexported) sizeToNumber.
const sizeToNumber = (value) => typeof value === 'string' ? parseFloat(value) : value;

export const getNearestGrid = ({ x, y }) => {
  let nearestX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  if (nearestX < 0) {
    nearestX = 0;
  }
  if (nearestX > CANVAS_SIZE.width) {
    nearestX = CANVAS_SIZE.width - (5 * GRID_SIZE);
  }

  let nearestY = Math.round(y / GRID_SIZE) * GRID_SIZE;
  if (nearestY < 0) {
    nearestY = 0;
  }
  if (nearestY > CANVAS_SIZE.height) {
    nearestY = CANVAS_SIZE.height - (5 * GRID_SIZE);
  }
  
  return {
    x: nearestX,
    y: nearestY,
  };
};

export const getValidPositionAndSize = ({ position, size }) => {
  let { x, y } = position;
  let { width, height } = size;

  if (width > CANVAS_SIZE.width) {
    width = CANVAS_SIZE.width;
  }

  if (height > CANVAS_SIZE.height) {
    height = CANVAS_SIZE.height;
  }

  if (x < 0) {
    x = 0;
  } else if (x + width > CANVAS_SIZE.width) {
    x = CANVAS_SIZE.width - DEFAULT_CARD_SIZE.width;
  }

  if (y < 0) {
    y = 0;
  } else if (y + height > CANVAS_SIZE.height) {
    y = CANVAS_SIZE.height - DEFAULT_CARD_SIZE.height;
  }

  return {
    position: {
      x,
      y,
    },
    size: {
      width,
      height,
    },
  };
};

// Pure layout math for the "group" toolbar button (unrelated to
// Canvas/groupDrag.js's live-drag "group drag" - this one is a single
// one-shot layout dispatch) - cards in, new positions out, no Redux. A
// simple even grid, not a bin packer: each COLUMN is only as wide as the
// widest card actually placed in it, and each ROW only as tall as the
// tallest card actually placed in it (not one single global cell size),
// so e.g. two same-size monster cards sharing a row/column aren't pushed
// apart by an unrelated wider/taller card elsewhere in the grid - at the
// cost of some whitespace around a smaller card that shares a row/column
// with a larger one. N<2 is a defensive no-op - the ToolMenu hook itself
// only calls this for a 2+ card selection, but this stays safe standalone.
//
// - Anchor: the ORIGINAL selection's bounding-box top-left (min x/y across
//   the input, computed before sorting) - the new layout starts exactly
//   there, per spec, even if that pushes the grid past the canvas edge.
//   Nothing here clamps to CANVAS_SIZE; matching the original top-left
//   takes priority over staying fully in bounds, same tradeoff the group
//   drag's own edge cases already accept.
// - Placement order: reading order (top-to-bottom, then left-to-right) by
//   each card's CURRENT position, not input-array/selection order - keeps
//   the grid's visual sense close to how the cards were already arranged.
// - Columns: ceil(sqrt(N)), giving a roughly-square grid; the last row is
//   left-packed (not centered) when N isn't a perfect square.
export const getGroupedPositions = (cards) => {
  if (!cards || cards.length < 2) return (cards ?? []).map(({ id, pos }) => ({ id, pos }));

  const originX = Math.min(...cards.map(c => c.pos.x));
  const originY = Math.min(...cards.map(c => c.pos.y));

  const ordered = [...cards].sort((a, b) => (a.pos.y - b.pos.y) || (a.pos.x - b.pos.x));
  const cols = Math.ceil(Math.sqrt(ordered.length));
  const rows = Math.ceil(ordered.length / cols);

  const cells = ordered.map((card, i) => ({
    card,
    row: Math.floor(i / cols),
    col: i % cols,
    width: sizeToNumber(card.size.width),
    height: sizeToNumber(card.size.height),
  }));

  // First row always fills every column, and the last row is never empty,
  // so every index 0..cols-1 / 0..rows-1 gets a real max from some card -
  // these never end up staying at their 0 fallback.
  const colWidths = new Array(cols).fill(0);
  const rowHeights = new Array(rows).fill(0);
  for (const cell of cells) {
    colWidths[cell.col] = Math.max(colWidths[cell.col], cell.width);
    rowHeights[cell.row] = Math.max(rowHeights[cell.row], cell.height);
  }

  // Cumulative start offset of each column/row - the sum of every
  // preceding column's width/row's height, plus one gap each.
  const colOffsets = [];
  colWidths.reduce((offset, width, i) => (colOffsets[i] = offset, offset + width + GROUP_LAYOUT_GAP), 0);
  const rowOffsets = [];
  rowHeights.reduce((offset, height, i) => (rowOffsets[i] = offset, offset + height + GROUP_LAYOUT_GAP), 0);

  return cells.map(({ card, row, col }) => ({
    id: card.id,
    pos: {
      x: Math.round((originX + colOffsets[col]) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((originY + rowOffsets[row]) / GRID_SIZE) * GRID_SIZE,
    },
  }));
};
