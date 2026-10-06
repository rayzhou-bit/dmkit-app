import { UNPLACED_GROUP_ID } from './cardGraph';

// Radial layout. Two properties drive the whole shape:
//
// 1. Labels live outside the ring and edges are chords inside it, so an edge
//    can never cross a label. That's structural, not a routing trick.
// 2. A tab is a ring, drawn as arcs over the cards that belong to it. A card
//    in two tabs is covered by two rings at once, so shared membership reads
//    as overlap instead of forcing the card into one box - which is what the
//    earlier region layout had to do, and got wrong.
//
// Deterministic, like the layout it replaces: same project, same picture, so
// the graph is somewhere you can build spatial memory.

export const NODE_RADIUS = 12;       // big enough to hold the card-type icon
export const VIEWBOX = 760;          // square; the view scales it to fit
const RING_RADIUS = 232;
const MAX_RING_GAP = 28;             // between one tab ring and the next
const MIN_INNER_RADIUS = 40;         // rings stop here, leaving the middle for chords
const FIRST_RING_INSET = 34;         // from the card ring to the outermost tab ring
const LABEL_OFFSET = 20;
const ARC_PAD = 0.42;                // of one step, so an arc overhangs its end cards

const TAU = Math.PI * 2;

// Consecutive runs of indices around the ring, wrap-around included, so a tab
// whose cards sit together draws as one arc rather than a dotted line of stubs.
export const consecutiveRuns = (indices, total) => {
  const sorted = [...new Set(indices)].sort((a, b) => a - b);
  if (!sorted.length) return [];
  const out = [];
  let run = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) run.push(sorted[i]);
    else { out.push(run); run = [sorted[i]]; }
  }
  out.push(run);
  // A run ending at the last slot joins one starting at slot 0 - they're
  // adjacent on a circle even though their indices aren't.
  if (out.length > 1 && out[0][0] === 0 && out.at(-1).at(-1) === total - 1) {
    out[0] = [...out.pop(), ...out[0]];
  }
  return out;
};

const arcPath = (cx, cy, r, start, end) => {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  // A full sweep can't be drawn as one arc (start and end coincide), so a tab
  // holding every card is split into two halves.
  if (end - start >= TAU - 1e-6) {
    const mx = cx + r * Math.cos(start + Math.PI);
    const my = cy + r * Math.sin(start + Math.PI);
    return `M${x1} ${y1} A${r} ${r} 0 1 1 ${mx} ${my} A${r} ${r} 0 1 1 ${x2} ${y2}`;
  }
  return `M${x1} ${y1} A${r} ${r} 0 ${end - start > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
};

// Primary tab (in tab-bar order), then title, then id. Each card gets exactly
// one slot; the id tiebreak keeps two same-named cards from swapping places.
const ringOrder = (nodes, groups) => {
  const rank = Object.fromEntries(groups.map((group, i) => [group.id, i]));
  const at = (node) => rank[node.primaryTabId] ?? (node.primaryTabId === UNPLACED_GROUP_ID ? groups.length : groups.length + 1);
  return [...nodes].sort((a, b) =>
    at(a) - at(b)
    || a.title.localeCompare(b.title)
    || a.id.localeCompare(b.id));
};

export const layoutCardGraph = ({ nodes = [], groups = [] } = {}) => {
  const centre = VIEWBOX / 2;
  const empty = { nodes: [], rings: [], width: VIEWBOX, height: VIEWBOX, centre, radius: RING_RADIUS };
  if (!nodes.length) return empty;

  const ordered = ringOrder(nodes, groups);
  const step = TAU / ordered.length;
  const angleAt = (i) => -Math.PI / 2 + i * step;
  const slotOf = Object.fromEntries(ordered.map((node, i) => [node.id, i]));

  const placed = ordered.map((node, i) => {
    const angle = angleAt(i);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Text on the left half would read upside down, so it's rotated a further
    // 180 degrees and anchored at its end instead.
    const flipped = cos < 0;
    const degrees = (angle * 180) / Math.PI;
    return {
      ...node,
      angle,
      x: centre + RING_RADIUS * cos,
      y: centre + RING_RADIUS * sin,
      labelX: centre + (RING_RADIUS + LABEL_OFFSET) * cos,
      labelY: centre + (RING_RADIUS + LABEL_OFFSET) * sin,
      labelRotation: flipped ? degrees + 180 : degrees,
      labelAnchor: flipped ? 'end' : 'start',
    };
  });

  // Gap shrinks once there are enough tabs that the fixed one would push the
  // innermost ring past the centre - every tab keeps a visible ring.
  const drawn = groups.filter(group => group.cardIds.length);
  const span = RING_RADIUS - FIRST_RING_INSET - MIN_INNER_RADIUS;
  const gap = Math.min(MAX_RING_GAP, span / Math.max(1, drawn.length - 1));

  const rings = drawn
    .map((group, i) => {
      const radius = RING_RADIUS - FIRST_RING_INSET - i * gap;
      const slots = group.cardIds.map(id => slotOf[id]).filter(slot => slot !== undefined);
      return {
        id: group.id,
        title: group.title,
        radius,
        arcs: consecutiveRuns(slots, ordered.length).map(run => {
          // A tab holding every card closes into a full ring; padding alone
          // can never span a whole turn, so it would otherwise draw with an
          // odd notch in it.
          const coversAll = run.length === ordered.length;
          const start = angleAt(run[0]) - (coversAll ? 0 : step * ARC_PAD);
          const end = coversAll
            ? start + TAU
            : angleAt(run[0] + run.length - 1) + step * ARC_PAD;
          return arcPath(centre, centre, radius, start, end);
        }),
      };
    })
    .filter(ring => ring.radius > 0);

  return { nodes: placed, rings, width: VIEWBOX, height: VIEWBOX, centre, radius: RING_RADIUS };
};
