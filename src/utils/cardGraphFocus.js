// Focused view: one tab's cards in the middle, everything that reaches them
// arranged in rings outward.
//
// Levels come from a breadth-first walk over the *undirected* edge graph - a
// reference in either direction is a connection for the purpose of "how far
// is this card from the tab".
//
// Edges are kept when they step between adjacent levels, and when both ends
// are in the centre. An edge *between* two outer cards on the same level is
// dropped: both are already explained by something closer in, so with A in
// the middle and B and C hanging off it, the B-C link is noise.
//
// Centre-to-centre is the exception because that's the tab's own structure -
// the Barrow's rooms point at the monsters sitting on the same tab, and
// hiding those leaves the view of that tab almost empty.

export const DEFAULT_MAX_LEVEL = 2;

const undirectedNeighbours = (edges) => {
  const map = new Map();
  const link = (a, b) => {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a).add(b);
  };
  for (const edge of edges) {
    link(edge.source, edge.target);
    link(edge.target, edge.source);
  }
  return map;
};

export const focusGraph = ({ nodes = [], edges = [] } = {}, tabId, maxLevel = DEFAULT_MAX_LEVEL) => {
  if (!tabId) return { nodes, edges, levels: {} };

  const centre = nodes.filter(node => node.tabIds?.includes(tabId));
  if (!centre.length) return { nodes: [], edges: [], levels: {} };

  const neighbours = undirectedNeighbours(edges);
  const levels = {};
  let frontier = centre.map(node => node.id);
  frontier.forEach(id => { levels[id] = 0; });

  for (let depth = 1; depth <= maxLevel && frontier.length; depth++) {
    const next = [];
    for (const id of frontier) {
      for (const neighbour of neighbours.get(id) ?? []) {
        if (levels[neighbour] !== undefined) continue;
        levels[neighbour] = depth;
        next.push(neighbour);
      }
    }
    frontier = next;
  }

  const kept = nodes
    .filter(node => levels[node.id] !== undefined)
    .map(node => ({ ...node, level: levels[node.id] }));

  const keptEdges = edges.filter(edge => {
    const from = levels[edge.source];
    const to = levels[edge.target];
    if (from === undefined || to === undefined) return false;
    if (from === 0 && to === 0) return true;
    return Math.abs(from - to) === 1;
  });

  return { nodes: kept, edges: keptEdges, levels };
};
