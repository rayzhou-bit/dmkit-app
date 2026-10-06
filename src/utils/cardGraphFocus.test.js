import { focusGraph } from './cardGraphFocus';

const node = (id, tabIds = []) => ({ id, title: id, color: 'gray', tabIds });
const edge = (source, target) => ({ source, target });

describe('focusGraph', () => {
  it('passes the graph through untouched with no tab selected', () => {
    const graph = { nodes: [node('a')], edges: [] };
    expect(focusGraph(graph, null).nodes).toEqual(graph.nodes);
  });

  it('puts the tab members at level 0', () => {
    const { levels } = focusGraph({
      nodes: [node('a', ['t1']), node('b', ['t1']), node('c', ['t2'])],
      edges: [],
    }, 't1');
    expect(levels).toEqual({ a: 0, b: 0 });
  });

  it('walks outward one level per hop', () => {
    const { levels } = focusGraph({
      nodes: [node('a', ['t1']), node('b'), node('c')],
      edges: [edge('a', 'b'), edge('b', 'c')],
    }, 't1');
    expect(levels).toEqual({ a: 0, b: 1, c: 2 });
  });

  // Direction is about which card holds the token; distance from the tab is
  // the same either way round.
  it('follows an edge pointing back toward the centre', () => {
    const { levels } = focusGraph({
      nodes: [node('a', ['t1']), node('b')],
      edges: [edge('b', 'a')],
    }, 't1');
    expect(levels.b).toBe(1);
  });

  it('stops at the level cap and drops anything beyond it', () => {
    const { nodes, levels } = focusGraph({
      nodes: [node('a', ['t1']), node('b'), node('c'), node('d')],
      edges: [edge('a', 'b'), edge('b', 'c'), edge('c', 'd')],
    }, 't1');
    expect(levels.d).toBeUndefined();
    expect(nodes.map(n => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('takes the shortest route when a card is reachable two ways', () => {
    const { levels } = focusGraph({
      nodes: [node('a', ['t1']), node('b'), node('c')],
      edges: [edge('a', 'b'), edge('b', 'c'), edge('a', 'c')],
    }, 't1');
    expect(levels.c).toBe(1);
  });

  // The rule the whole view hangs on: A in the middle, B and C hanging off
  // it, and the B-C link is noise because both are already explained by A.
  it('hides an edge between two cards on the same level', () => {
    const { edges } = focusGraph({
      nodes: [node('a', ['t1']), node('b'), node('c')],
      edges: [edge('a', 'b'), edge('a', 'c'), edge('b', 'c')],
    }, 't1');
    expect(edges).toEqual([edge('a', 'b'), edge('a', 'c')]);
  });

  // The exception to the same-level rule: this is the tab's own structure,
  // and hiding it leaves a focused tab with almost nothing drawn.
  it('keeps an edge between two cards that are both in the centre tab', () => {
    const { edges } = focusGraph({
      nodes: [node('a', ['t1']), node('b', ['t1'])],
      edges: [edge('a', 'b')],
    }, 't1');
    expect(edges).toEqual([edge('a', 'b')]);
  });

  it('keeps the level 1 to level 2 step', () => {
    const { edges } = focusGraph({
      nodes: [node('a', ['t1']), node('b'), node('c')],
      edges: [edge('a', 'b'), edge('b', 'c')],
    }, 't1');
    expect(edges).toEqual([edge('a', 'b'), edge('b', 'c')]);
  });

  it('drops an edge reaching a card past the cap', () => {
    const { edges } = focusGraph({
      nodes: [node('a', ['t1']), node('b'), node('c'), node('d')],
      edges: [edge('a', 'b'), edge('b', 'c'), edge('c', 'd')],
    }, 't1');
    expect(edges).toEqual([edge('a', 'b'), edge('b', 'c')]);
  });

  it('keeps an unconnected tab member in the centre', () => {
    const { nodes } = focusGraph({
      nodes: [node('a', ['t1']), node('lonely', ['t1'])],
      edges: [],
    }, 't1');
    expect(nodes.map(n => n.id)).toEqual(['a', 'lonely']);
  });

  it('returns nothing for a tab with no cards', () => {
    expect(focusGraph({ nodes: [node('a', ['t1'])], edges: [] }, 'empty'))
      .toEqual({ nodes: [], edges: [], levels: {} });
  });
});
