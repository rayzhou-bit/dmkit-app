import { getGroupedPositions } from './gridUtils';
import { GRID_SIZE, GROUP_LAYOUT_GAP } from '../constants/dimensions';

// Bounding box of a card's own footprint, for overlap checks below.
const box = (card) => {
  const width = typeof card.size.width === 'string' ? parseFloat(card.size.width) : card.size.width;
  const height = typeof card.size.height === 'string' ? parseFloat(card.size.height) : card.size.height;
  return { left: card.pos.x, right: card.pos.x + width, top: card.pos.y, bottom: card.pos.y + height };
};

const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const noPairOverlaps = (cards) => {
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (overlaps(box(cards[i]), box(cards[j]))) return false;
    }
  }
  return true;
};

// Merges getGroupedPositions' returned positions back onto the original
// cards (by id), for overlap-checking the actual laid-out footprints.
const applyPositions = (cards, positions) => cards.map(card => ({
  ...card,
  pos: positions.find(p => p.id === card.id).pos,
}));

describe('getGroupedPositions', () => {
  it('exactly 2 same-size cards - 2 columns, 1 row, anchored at the original top-left', () => {
    const cards = [
      { id: 'a', pos: { x: 120, y: 240 }, size: { width: 240, height: 120 } },
      { id: 'b', pos: { x: 600, y: 0 }, size: { width: 240, height: 120 } },
    ];
    const positions = getGroupedPositions(cards);
    expect(positions).toEqual([
      { id: 'b', pos: { x: 120, y: 0 } }, // reading order: b (y=0) before a (y=240)
      { id: 'a', pos: { x: 120 + 240 + GROUP_LAYOUT_GAP, y: 0 } },
    ]);
  });

  it('N=4 uniform-size cards - a 2x2 grid, exact positions', () => {
    const cards = [
      { id: 'a', pos: { x: 0, y: 0 }, size: { width: 120, height: 120 } },
      { id: 'b', pos: { x: 0, y: 0 }, size: { width: 120, height: 120 } },
      { id: 'c', pos: { x: 0, y: 0 }, size: { width: 120, height: 120 } },
      { id: 'd', pos: { x: 0, y: 0 }, size: { width: 120, height: 120 } },
    ];
    const positions = getGroupedPositions(cards);
    const cell = 120 + GROUP_LAYOUT_GAP;
    expect(positions.map(p => p.pos)).toEqual([
      { x: 0, y: 0 }, { x: cell, y: 0 },
      { x: 0, y: cell }, { x: cell, y: cell },
    ]);
  });

  it('N=5 (not a perfect square) - 3 columns, last row left-packed not centered', () => {
    const cards = Array.from({ length: 5 }, (_, i) => (
      { id: `c${i}`, pos: { x: i * 1000, y: 0 }, size: { width: 120, height: 120 } }
    ));
    const positions = getGroupedPositions(cards);
    const cell = 120 + GROUP_LAYOUT_GAP;
    // Reading order is already left-to-right here (all y=0), so c0..c4 fill
    // row-major: row 0 gets c0,c1,c2 (3 cols), row 1 gets c3,c4 starting at
    // col 0 - left-packed, not centered under the 3-wide row above.
    const byId = Object.fromEntries(positions.map(p => [p.id, p.pos]));
    expect(byId.c0).toEqual({ x: 0, y: 0 });
    expect(byId.c1).toEqual({ x: cell, y: 0 });
    expect(byId.c2).toEqual({ x: cell * 2, y: 0 });
    expect(byId.c3).toEqual({ x: 0, y: cell });
    expect(byId.c4).toEqual({ x: cell, y: cell });
  });

  it('cards of very different sizes - each column/row sized to its own widest/tallest occupant, zero overlap', () => {
    const cards = [
      { id: 'big', pos: { x: 0, y: 0 }, size: { width: 480, height: 360 } },
      { id: 'small1', pos: { x: 0, y: 0 }, size: { width: 120, height: 96 } },
      { id: 'small2', pos: { x: 0, y: 0 }, size: { width: 120, height: 96 } },
    ];
    const positions = getGroupedPositions(cards);
    // 2 columns (ceil(sqrt(3))): row0 = big,small1; row1 = small2.
    // col0 = max(big=480, small2=120) = 480 wide; col1 = small1 = 120 wide.
    // row0 = max(big=360, small1=96) = 360 tall; row1 = small2 = 96 tall.
    const byId = Object.fromEntries(positions.map(p => [p.id, p.pos]));
    expect(byId.big).toEqual({ x: 0, y: 0 });
    expect(byId.small1).toEqual({ x: 480 + GROUP_LAYOUT_GAP, y: 0 });
    expect(byId.small2).toEqual({ x: 0, y: 360 + GROUP_LAYOUT_GAP });
    expect(noPairOverlaps(applyPositions(cards, positions))).toBe(true);
  });

  it('two same-row cards are spaced by their own column widths, not inflated by a much wider card sharing the OTHER column', () => {
    // Regression: an earlier version used one global cell size (the single
    // largest card across the WHOLE selection), so e.g. two same-size
    // monster ("stat") cards placed side by side ended up spaced apart by
    // a much bigger gap than their own size - stretched to match an
    // unrelated wide card elsewhere in the grid. Per-column sizing fixes
    // this: column 0's width comes only from what's actually in column 0.
    const cards = [
      { id: 'stat1', pos: { x: 0, y: 0 }, size: { width: 288, height: 432 } },
      { id: 'stat2', pos: { x: 400, y: 0 }, size: { width: 288, height: 432 } },
      { id: 'other1', pos: { x: 0, y: 600 }, size: { width: 200, height: 100 } },
      { id: 'wide', pos: { x: 400, y: 600 }, size: { width: 480, height: 100 } },
    ];
    const positions = getGroupedPositions(cards);
    const byId = Object.fromEntries(positions.map(p => [p.id, p.pos]));
    // stat1/stat2 land in row 0, columns 0/1 (reading order) - 'wide'
    // shares column 1 with stat2, not column 0, so it must not affect the
    // stat1->stat2 gap at all.
    expect(byId.stat2.x - byId.stat1.x).toBe(288 + GROUP_LAYOUT_GAP);
  });

  it('cards already overlapping in their original positions still end up non-overlapping', () => {
    const cards = [
      { id: 'a', pos: { x: 100, y: 100 }, size: { width: 200, height: 200 } },
      { id: 'b', pos: { x: 150, y: 150 }, size: { width: 200, height: 200 } },
      { id: 'c', pos: { x: 120, y: 120 }, size: { width: 200, height: 200 } },
    ];
    const positions = getGroupedPositions(cards);
    expect(noPairOverlaps(applyPositions(cards, positions))).toBe(true);
  });

  it('size as a "Npx" string and as a plain number give the same numeric result', () => {
    const cardsWithStrings = [
      { id: 'a', pos: { x: 0, y: 0 }, size: { width: '240px', height: '120px' } },
      { id: 'b', pos: { x: 500, y: 0 }, size: { width: 240, height: 120 } },
    ];
    const cardsWithNumbers = [
      { id: 'a', pos: { x: 0, y: 0 }, size: { width: 240, height: 120 } },
      { id: 'b', pos: { x: 500, y: 0 }, size: { width: 240, height: 120 } },
    ];
    expect(getGroupedPositions(cardsWithStrings)).toEqual(getGroupedPositions(cardsWithNumbers));
  });

  it('anchors at the ORIGINAL bounding-box top-left, computed before sorting/shuffling', () => {
    // Deliberately unsorted/scrambled input order; positions are already
    // grid-aligned multiples of GRID_SIZE so the expected values need no
    // rounding (grid-snapping itself is covered separately below).
    const cards = [
      { id: 'c', pos: { x: 504, y: 504 }, size: { width: 120, height: 120 } },
      { id: 'a', pos: { x: 120, y: 60 }, size: { width: 120, height: 120 } },
      { id: 'b', pos: { x: 900, y: 12 }, size: { width: 120, height: 120 } },
    ];
    const positions = getGroupedPositions(cards);
    const xs = positions.map(p => p.pos.x);
    const ys = positions.map(p => p.pos.y);
    expect(Math.min(...xs)).toBe(120); // min x across original input (card 'a')
    expect(Math.min(...ys)).toBe(12);  // min y across original input (card 'b', not 'a')
  });

  it('placement follows reading order (top-to-bottom, then left-to-right) by current position, not input order', () => {
    const cards = [
      { id: 'bottom-right', pos: { x: 200, y: 200 }, size: { width: 120, height: 120 } },
      { id: 'top-left', pos: { x: 0, y: 0 }, size: { width: 120, height: 120 } },
      { id: 'top-right', pos: { x: 200, y: 0 }, size: { width: 120, height: 120 } },
    ];
    const positions = getGroupedPositions(cards);
    expect(positions.map(p => p.id)).toEqual(['top-left', 'top-right', 'bottom-right']);
  });

  it('every output position is grid-snapped even when the origin is off-grid', () => {
    const cards = [
      { id: 'a', pos: { x: 7, y: 13 }, size: { width: 100, height: 50 } },
      { id: 'b', pos: { x: 250, y: 5 }, size: { width: 100, height: 50 } },
    ];
    const positions = getGroupedPositions(cards);
    for (const { pos } of positions) {
      expect(pos.x % GRID_SIZE).toBe(0);
      expect(pos.y % GRID_SIZE).toBe(0);
    }
  });

  it('is a no-op (positions unchanged) for fewer than 2 cards', () => {
    const cards = [{ id: 'a', pos: { x: 42, y: 17 }, size: { width: 100, height: 100 } }];
    expect(getGroupedPositions(cards)).toEqual([{ id: 'a', pos: { x: 42, y: 17 } }]);
    expect(getGroupedPositions([])).toEqual([]);
    expect(getGroupedPositions(undefined)).toEqual([]);
  });
});
