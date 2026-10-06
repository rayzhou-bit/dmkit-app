// Deterministic layout: the same project always produces the same picture,
// so the graph is somewhere you can build spatial memory rather than a fresh
// arrangement every visit. That matters more here than the organic clustering
// a force simulation would give, because this app is already a spatial canvas
// and a layout that moved on its own would compete with the positions the
// user authored themselves.

export const NODE_RADIUS = 7;
export const LABEL_WIDTH = 132;      // node + its title, the real cell width
const CELL_HEIGHT = 30;
const GROUP_PADDING = 18;
const GROUP_HEADER = 24;
const GROUP_GAP = 36;
const MAX_ROW_WIDTH = 1200;          // flow groups onto a new row past this

// Same ceil(sqrt(n)) shape the group toolbar button uses, so a cluster of
// cards reads the same way in both places.
const columnsFor = (count) => Math.max(1, Math.ceil(Math.sqrt(count)));

// Title then id: titles are what the reader sees, and the id tiebreak keeps
// two identically-named cards from swapping places between renders.
const sortCards = (cardIds, nodesById) => [...cardIds].sort((a, b) => {
  const byTitle = (nodesById[a]?.title ?? '').localeCompare(nodesById[b]?.title ?? '');
  return byTitle !== 0 ? byTitle : a.localeCompare(b);
});

export const layoutCardGraph = ({ nodes = [], groups = [] } = {}) => {
  const nodesById = Object.fromEntries(nodes.map(node => [node.id, node]));

  // Size every group from its own contents first, then flow them.
  const sized = groups.map(group => {
    const cardIds = sortCards(group.cardIds, nodesById);
    const columns = columnsFor(cardIds.length);
    const rows = Math.max(1, Math.ceil(cardIds.length / columns));
    return {
      ...group,
      cardIds,
      columns,
      width: GROUP_PADDING * 2 + columns * LABEL_WIDTH,
      height: GROUP_PADDING * 2 + GROUP_HEADER + rows * CELL_HEIGHT,
    };
  });

  const placedGroups = [];
  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;

  for (const group of sized) {
    if (cursorX > 0 && cursorX + group.width > MAX_ROW_WIDTH) {
      cursorX = 0;
      cursorY += rowHeight + GROUP_GAP;
      rowHeight = 0;
    }
    placedGroups.push({ ...group, x: cursorX, y: cursorY });
    cursorX += group.width + GROUP_GAP;
    rowHeight = Math.max(rowHeight, group.height);
  }

  const positions = {};
  for (const group of placedGroups) {
    group.cardIds.forEach((cardId, index) => {
      const column = index % group.columns;
      const row = Math.floor(index / group.columns);
      positions[cardId] = {
        x: group.x + GROUP_PADDING + column * LABEL_WIDTH + NODE_RADIUS,
        y: group.y + GROUP_PADDING + GROUP_HEADER + row * CELL_HEIGHT + CELL_HEIGHT / 2,
      };
    });
  }

  const positionedNodes = nodes
    .filter(node => positions[node.id])
    .map(node => ({ ...node, ...positions[node.id] }));

  return {
    nodes: positionedNodes,
    groups: placedGroups,
    width: placedGroups.reduce((max, g) => Math.max(max, g.x + g.width), 0),
    height: placedGroups.reduce((max, g) => Math.max(max, g.y + g.height), 0),
  };
};
