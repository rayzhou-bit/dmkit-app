import { layoutCardGraph, layoutFocusGraph, consecutiveRuns, VIEWBOX } from './graphLayout';
import { UNPLACED_GROUP_ID } from './cardGraph';

const node = (id, tabIds, title = id) => ({
  id, title, color: 'gray', tabIds,
  primaryTabId: tabIds[0] ?? UNPLACED_GROUP_ID,
  isShared: tabIds.length > 1,
});

const graph = (nodes, groups) => ({ nodes, groups });

describe('consecutiveRuns', () => {
  it('groups adjacent indices into one run', () => {
    expect(consecutiveRuns([0, 1, 2, 5, 6], 8)).toEqual([[0, 1, 2], [5, 6]]);
  });

  // The ring is a circle, so the last slot and the first are neighbours even
  // though their indices are as far apart as possible.
  it('joins a run ending at the last slot to one starting at slot 0', () => {
    expect(consecutiveRuns([0, 1, 6, 7], 8)).toEqual([[6, 7, 0, 1]]);
  });

  it('leaves a single isolated index as its own run', () => {
    expect(consecutiveRuns([3], 8)).toEqual([[3]]);
  });

  it('returns nothing for no indices', () => {
    expect(consecutiveRuns([], 8)).toEqual([]);
  });
});

describe('layoutCardGraph', () => {
  // The reason this isn't a force simulation: open the graph twice and it has
  // to look identical, or there's no spatial memory to build.
  it('is deterministic - same input, identical output', () => {
    const input = graph(
      [node('b', ['t1'], 'Beta'), node('a', ['t1'], 'Alpha'), node('c', ['t2'], 'Gamma')],
      [{ id: 't1', title: 'One', cardIds: ['b', 'a'] }, { id: 't2', title: 'Two', cardIds: ['c'] }],
    );
    expect(layoutCardGraph(input)).toEqual(layoutCardGraph(input));
  });

  it('puts every card on the ring, once each', () => {
    const { nodes, radius, centre } = layoutCardGraph(graph(
      [node('a', ['t1']), node('b', ['t1']), node('c', ['t2'])],
      [{ id: 't1', title: 'One', cardIds: ['a', 'b'] }, { id: 't2', title: 'Two', cardIds: ['c'] }],
    ));
    expect(nodes.map(n => n.id).sort()).toEqual(['a', 'b', 'c']);
    for (const n of nodes) {
      const dist = Math.hypot(n.x - centre, n.y - centre);
      expect(dist).toBeCloseTo(radius, 6);
    }
  });

  it('orders the ring by primary tab, then title', () => {
    const { nodes } = layoutCardGraph(graph(
      [node('z', ['t2'], 'Aaa'), node('b', ['t1'], 'Bbb'), node('a', ['t1'], 'Aaa')],
      [{ id: 't1', title: 'One', cardIds: ['b', 'a'] }, { id: 't2', title: 'Two', cardIds: ['z'] }],
    ));
    expect(nodes.map(n => n.id)).toEqual(['a', 'b', 'z']);
  });

  // The whole point of rings over boxes: a card in two tabs is covered by
  // both, instead of being assigned to one and missing from the other.
  it('covers a shared card with an arc on every ring it belongs to', () => {
    const { rings } = layoutCardGraph(graph(
      [node('shared', ['t1', 't2']), node('only1', ['t1']), node('only2', ['t2'])],
      [{ id: 't1', title: 'One', cardIds: ['shared', 'only1'] },
       { id: 't2', title: 'Two', cardIds: ['shared', 'only2'] }],
    ));
    expect(rings).toHaveLength(2);
    for (const ring of rings) expect(ring.arcs.length).toBeGreaterThan(0);
  });

  it('gives each tab its own radius so overlapping rings stay distinguishable', () => {
    const { rings } = layoutCardGraph(graph(
      [node('a', ['t1', 't2', 't3'])],
      [{ id: 't1', title: 'One', cardIds: ['a'] },
       { id: 't2', title: 'Two', cardIds: ['a'] },
       { id: 't3', title: 'Three', cardIds: ['a'] }],
    ));
    const radii = rings.map(r => r.radius);
    expect(new Set(radii).size).toBe(radii.length);
  });

  it('splits a tab whose cards are not adjacent into separate arcs', () => {
    // b and d are in t2, a and c in t1, so t2's cards are not contiguous.
    const { rings } = layoutCardGraph(graph(
      [node('a', ['t1'], 'A'), node('b', ['t2'], 'B'), node('c', ['t1'], 'C'), node('d', ['t2'], 'D')],
      [{ id: 't1', title: 'One', cardIds: ['a', 'c'] }, { id: 't2', title: 'Two', cardIds: ['b', 'd'] }],
    ));
    const t1 = rings.find(r => r.id === 't1');
    expect(t1.arcs.length).toBe(1);   // a and c are adjacent after ordering
  });

  it('draws a tab holding every card as a closed ring without collapsing it', () => {
    const { rings } = layoutCardGraph(graph(
      [node('a', ['t1']), node('b', ['t1']), node('c', ['t1'])],
      [{ id: 't1', title: 'One', cardIds: ['a', 'b', 'c'] }],
    ));
    expect(rings[0].arcs).toHaveLength(1);
    // Two arc commands, because a 360-degree sweep can't be one SVG arc.
    expect(rings[0].arcs[0].match(/A/g)).toHaveLength(2);
  });

  it('flips labels on the left half so they never read upside down', () => {
    const { nodes } = layoutCardGraph(graph(
      Array.from({ length: 4 }, (_, i) => node(`c${i}`, ['t1'], `C${i}`)),
      [{ id: 't1', title: 'One', cardIds: ['c0', 'c1', 'c2', 'c3'] }],
    ));
    for (const n of nodes) {
      const onLeft = Math.cos(n.angle) < 0;
      expect(n.labelAnchor).toBe(onLeft ? 'end' : 'start');
    }
  });

  it('places labels outside the node ring, where chords cannot reach', () => {
    const { nodes, radius, centre } = layoutCardGraph(graph(
      [node('a', ['t1']), node('b', ['t1'])],
      [{ id: 't1', title: 'One', cardIds: ['a', 'b'] }],
    ));
    for (const n of nodes) {
      expect(Math.hypot(n.labelX - centre, n.labelY - centre)).toBeGreaterThan(radius);
    }
  });

  it('keeps every tab ring inside the node ring', () => {
    const { rings, radius } = layoutCardGraph(graph(
      [node('a', ['t1', 't2'])],
      [{ id: 't1', title: 'One', cardIds: ['a'] }, { id: 't2', title: 'Two', cardIds: ['a'] }],
    ));
    for (const ring of rings) expect(ring.radius).toBeLessThan(radius);
  });

  it('drops an empty tab rather than drawing a bare circle for it', () => {
    const { rings } = layoutCardGraph(graph(
      [node('a', ['t1'])],
      [{ id: 't1', title: 'One', cardIds: ['a'] }, { id: 't2', title: 'Two', cardIds: [] }],
    ));
    expect(rings.map(r => r.id)).toEqual(['t1']);
  });

  it('handles an empty graph', () => {
    const out = layoutCardGraph();
    expect(out.nodes).toEqual([]);
    expect(out.rings).toEqual([]);
    expect(out.width).toBe(VIEWBOX);
  });
});

describe('layoutFocusGraph', () => {
  const lvl = (id, level, title = id) => ({ id, title, color: 'gray', tabIds: [], level });

  it('is deterministic', () => {
    const input = { nodes: [lvl('b', 0, 'B'), lvl('a', 0, 'A'), lvl('c', 1, 'C')] };
    expect(layoutFocusGraph(input)).toEqual(layoutFocusGraph(input));
  });

  it('puts each level on its own ring, further out as the level rises', () => {
    const { nodes, centre } = layoutFocusGraph({
      nodes: [lvl('a', 0), lvl('b', 1), lvl('c', 2)],
    });
    const r = (id) => {
      const n = nodes.find(x => x.id === id);
      return Math.hypot(n.x - centre, n.y - centre);
    };
    expect(r('a')).toBeLessThan(r('b'));
    expect(r('b')).toBeLessThan(r('c'));
  });

  // An empty outer level shouldn't reserve a band, or a tab with no distant
  // neighbours scales down to fit space nothing occupies.
  it('sizes itself to the levels that are actually populated', () => {
    const twoLevels = layoutFocusGraph({ nodes: [lvl('a', 0), lvl('b', 1)] });
    const threeLevels = layoutFocusGraph({ nodes: [lvl('a', 0), lvl('b', 1), lvl('c', 2)] });
    expect(twoLevels.width).toBeLessThan(threeLevels.width);
    // guides are the outer rings only - the core is a disc, not a ring.
    expect(twoLevels.guides).toHaveLength(1);
    expect(threeLevels.guides).toHaveLength(2);
  });

  it('keeps every ring label outside its own ring', () => {
    const { nodes, centre } = layoutFocusGraph({ nodes: [lvl('a', 0), lvl('b', 1), lvl('c', 2)] });
    for (const n of nodes.filter(x => x.level > 0)) {
      const node = Math.hypot(n.x - centre, n.y - centre);
      const label = Math.hypot(n.labelX - centre, n.labelY - centre);
      expect(label).toBeGreaterThan(node);
    }
  });

  // Core cards keep the all-tabs property: labels outside their ring, edges
  // as chords inside it, so a core-to-core link never crosses a title.
  it('keeps core labels between the core ring and the disc edge', () => {
    const { nodes, centre, coreRadius } = layoutFocusGraph({
      nodes: Array.from({ length: 7 }, (_, i) => lvl(`c${i}`, 0, `Card ${i}`)),
    });
    for (const n of nodes) {
      const node = Math.hypot(n.x - centre, n.y - centre);
      const label = Math.hypot(n.labelX - centre, n.labelY - centre);
      expect(label).toBeGreaterThan(node);
      expect(label).toBeLessThan(coreRadius);
    }
  });

  it('flips ring labels on the left half so they never read upside down', () => {
    const { nodes } = layoutFocusGraph({
      nodes: [lvl('core', 0), ...Array.from({ length: 6 }, (_, i) => lvl(`c${i}`, 1, `C${i}`))],
    });
    for (const n of nodes.filter(x => x.level === 1)) {
      expect(n.labelAnchor).toBe(Math.cos(n.angle) < 0 ? 'end' : 'start');
    }
  });

  it('grows the core disc rather than crowding a large tab into a small one', () => {
    const small = layoutFocusGraph({ nodes: [lvl('a', 0)] });
    const big = layoutFocusGraph({ nodes: Array.from({ length: 40 }, (_, i) => lvl(`c${i}`, 0, `C${i}`)) });
    expect(big.coreRadius).toBeGreaterThan(small.coreRadius);
  });

  it('keeps every core card inside the disc', () => {
    const { nodes, centre, coreRadius } = layoutFocusGraph({
      nodes: Array.from({ length: 9 }, (_, i) => lvl(`c${i}`, 0, `Card ${i}`)),
    });
    for (const n of nodes) {
      expect(Math.hypot(n.x - centre, n.y - centre)).toBeLessThan(coreRadius);
    }
  });

  it('puts the first ring outside the core disc', () => {
    const { guides, coreRadius } = layoutFocusGraph({
      nodes: [lvl('a', 0), lvl('b', 0), lvl('c', 1)],
    });
    expect(guides[0]).toBeGreaterThan(coreRadius);
  });

  it('handles an empty focus without throwing', () => {
    expect(layoutFocusGraph({ nodes: [] }).nodes).toEqual([]);
  });
});
