import { layoutCardGraph, LABEL_WIDTH } from './graphLayout';

const node = (id, groupId, title = id) => ({ id, groupId, title, tabIds: [groupId], color: 'gray' });

const graph = (nodes, groups) => ({ nodes, groups });

describe('layoutCardGraph', () => {
  // The whole reason this isn't a force simulation: open the graph twice and
  // it has to look identical, or there's no spatial memory to build.
  it('is deterministic - same input, byte-identical output', () => {
    const input = graph(
      [node('b', 't1', 'Beta'), node('a', 't1', 'Alpha'), node('c', 't2', 'Gamma')],
      [{ id: 't1', title: 'One', cardIds: ['b', 'a'] }, { id: 't2', title: 'Two', cardIds: ['c'] }],
    );
    expect(layoutCardGraph(input)).toEqual(layoutCardGraph(input));
  });

  it('orders cards within a group by title, not by the order they arrived in', () => {
    const { nodes } = layoutCardGraph(graph(
      [node('z', 't1', 'Alpha'), node('a', 't1', 'Zeta')],
      [{ id: 't1', title: 'One', cardIds: ['a', 'z'] }],
    ));
    const alpha = nodes.find(n => n.id === 'z');
    const zeta = nodes.find(n => n.id === 'a');
    expect(alpha.x).toBeLessThanOrEqual(zeta.x);
    expect(alpha.y).toBeLessThanOrEqual(zeta.y);
  });

  // Two cards sharing a title must not swap places between renders.
  it('breaks a title tie on id so position is still stable', () => {
    const run = () => layoutCardGraph(graph(
      [node('b', 't1', 'Same'), node('a', 't1', 'Same')],
      [{ id: 't1', title: 'One', cardIds: ['b', 'a'] }],
    )).nodes.map(n => `${n.id}:${n.x},${n.y}`);
    expect(run()).toEqual(run());
  });

  it('gives every node a position inside its own group box', () => {
    const { nodes, groups } = layoutCardGraph(graph(
      [node('a', 't1'), node('b', 't2')],
      [{ id: 't1', title: 'One', cardIds: ['a'] }, { id: 't2', title: 'Two', cardIds: ['b'] }],
    ));
    for (const n of nodes) {
      const g = groups.find(group => group.id === n.groupId);
      expect(n.x).toBeGreaterThanOrEqual(g.x);
      expect(n.x).toBeLessThanOrEqual(g.x + g.width);
      expect(n.y).toBeGreaterThanOrEqual(g.y);
      expect(n.y).toBeLessThanOrEqual(g.y + g.height);
    }
  });

  it('lays groups out without overlapping each other', () => {
    const groups = Array.from({ length: 6 }, (_, i) => ({
      id: `t${i}`, title: `Tab ${i}`, cardIds: [`c${i}`],
    }));
    const nodes = groups.map((g, i) => node(`c${i}`, g.id));
    const placed = layoutCardGraph(graph(nodes, groups)).groups;

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        const overlaps = a.x < b.x + b.width && a.x + a.width > b.x
          && a.y < b.y + b.height && a.y + a.height > b.y;
        expect(overlaps).toBe(false);
      }
    }
  });

  it('wraps onto a new row rather than growing one row without limit', () => {
    const groups = Array.from({ length: 12 }, (_, i) => ({
      id: `t${i}`, title: `Tab ${i}`, cardIds: [`c${i}`],
    }));
    const nodes = groups.map((g, i) => node(`c${i}`, g.id));
    const { groups: placed, width } = layoutCardGraph(graph(nodes, groups));
    expect(new Set(placed.map(g => g.y)).size).toBeGreaterThan(1);
    expect(width).toBeLessThan(12 * LABEL_WIDTH * 2);
  });

  it('reports a bounding box that contains every group', () => {
    const { groups, width, height } = layoutCardGraph(graph(
      [node('a', 't1'), node('b', 't2')],
      [{ id: 't1', title: 'One', cardIds: ['a'] }, { id: 't2', title: 'Two', cardIds: ['b'] }],
    ));
    for (const g of groups) {
      expect(g.x + g.width).toBeLessThanOrEqual(width);
      expect(g.y + g.height).toBeLessThanOrEqual(height);
    }
  });

  it('drops a node whose group was not laid out instead of placing it at 0,0', () => {
    const { nodes } = layoutCardGraph(graph([node('orphan', 'missing')], []));
    expect(nodes).toEqual([]);
  });

  it('handles an empty graph', () => {
    expect(layoutCardGraph()).toEqual({ nodes: [], groups: [], width: 0, height: 0 });
  });
});
