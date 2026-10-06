import { buildCardGraph, collectRefText, UNPLACED_GROUP_ID } from './cardGraph';
import { CARD_TYPES } from '../constants/cards';
import { buildCustomContent } from '../constants/custom';
import { buildNoteContent } from '../constants/note';
import { buildMonsterContent } from '../constants/monster';

const customCard = (title, text, views = {}) => ({
  title, color: 'gray', type: CARD_TYPES.custom, views,
  content: buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text }] }),
});

const project = (cards, views = { t1: { title: 'One' } }, viewOrder = ['t1']) =>
  buildCardGraph({ cards, views, viewOrder });

describe('collectRefText - every surface a token can live in', () => {
  it('reads freeform text blocks, skipping image blocks', () => {
    const card = {
      type: CARD_TYPES.custom,
      content: buildCustomContent({ blocks: [
        { id: 'b1', type: 'text', text: 'first' },
        { id: 'b2', type: 'image', image: 'data:x', alt: 'not text' },
        { id: 'b3', type: 'text', text: 'second' },
      ] }),
    };
    expect(collectRefText(card)).toEqual(['first', 'second']);
  });

  it("reads a monster's notes blocks", () => {
    const card = {
      type: CARD_TYPES.monster,
      content: buildMonsterContent({ notes: [{ id: 'n1', type: 'text', text: 'behaviour' }] }),
    };
    expect(collectRefText(card)).toEqual(['behaviour']);
  });

  // The note entry *name* is deliberately excluded - it's a short title that
  // doesn't render refs (see NoteEntry), so a token there isn't a real edge.
  it("reads a note's description and entry descriptions, but not entry names", () => {
    const card = {
      type: CARD_TYPES.note,
      content: buildNoteContent({
        description: 'the description',
        entries: [{ id: 'e1', name: 'name should be ignored', description: 'entry text' }],
      }),
    };
    expect(collectRefText(card)).toEqual(['the description', 'entry text']);
  });
});

describe('buildCardGraph - edges', () => {
  it('draws a directed edge from the card holding the token to its target', () => {
    const { edges } = project({
      a: customCard('A', 'see #[B](b)', { t1: {} }),
      b: customCard('B', 'nothing', { t1: {} }),
    });
    expect(edges).toEqual([{ source: 'a', target: 'b' }]);
  });

  // Two mentions of the same card is one relationship, not two - otherwise a
  // card referenced five times in one block draws five identical lines.
  it('dedupes repeated references between the same pair', () => {
    const { edges } = project({
      a: customCard('A', '#[B](b) and again #[B](b)', { t1: {} }),
      b: customCard('B', '', { t1: {} }),
    });
    expect(edges).toEqual([{ source: 'a', target: 'b' }]);
  });

  it('keeps both directions when two cards reference each other', () => {
    const { edges } = project({
      a: customCard('A', '#[B](b)', { t1: {} }),
      b: customCard('B', '#[A](a)', { t1: {} }),
    });
    expect(edges).toHaveLength(2);
    expect(edges).toContainEqual({ source: 'a', target: 'b' });
    expect(edges).toContainEqual({ source: 'b', target: 'a' });
  });

  it('drops a self-reference - a loop tells the reader nothing', () => {
    const { edges } = project({ a: customCard('A', 'see #[A](a)', { t1: {} }) });
    expect(edges).toEqual([]);
  });

  // CardRefDisplay renders these as dangling chips, but there's no node to
  // draw a line to, so the graph just omits them.
  it('drops an edge to a deleted card', () => {
    const { edges } = project({ a: customCard('A', 'see #[Gone](ghost)', { t1: {} }) });
    expect(edges).toEqual([]);
  });

  it('finds edges in note entries and monster notes, not just freeform blocks', () => {
    const { edges } = project({
      n: {
        title: 'Room', type: CARD_TYPES.note, views: { t1: {} },
        content: buildNoteContent({ description: '', entries: [{ id: 'e1', name: 'Guard', description: 'a #[Goblin](m)' }] }),
      },
      m: {
        title: 'Goblin', type: CARD_TYPES.monster, views: { t1: {} },
        content: buildMonsterContent({ notes: [{ id: 'n1', type: 'text', text: 'leads the #[Room](n)' }] }),
      },
    });
    expect(edges).toContainEqual({ source: 'n', target: 'm' });
    expect(edges).toContainEqual({ source: 'm', target: 'n' });
  });
});

describe('buildCardGraph - grouping', () => {
  const views = { t1: { title: 'One' }, t2: { title: 'Two' } };

  it('places a card in its first tab by viewOrder, not object key order', () => {
    const { nodes } = buildCardGraph({
      cards: { a: customCard('A', '', { t2: {}, t1: {} }) },
      views,
      viewOrder: ['t1', 't2'],
    });
    expect(nodes[0].groupId).toBe('t1');

    const reordered = buildCardGraph({
      cards: { a: customCard('A', '', { t2: {}, t1: {} }) },
      views,
      viewOrder: ['t2', 't1'],
    });
    expect(reordered.nodes[0].groupId).toBe('t2');
  });

  it('marks a card that appears in more than one tab, and keeps the full membership', () => {
    const { nodes } = buildCardGraph({
      cards: { a: customCard('A', '', { t1: {}, t2: {} }), b: customCard('B', '', { t1: {} }) },
      views,
      viewOrder: ['t1', 't2'],
    });
    const [a, b] = nodes;
    expect(a.isShared).toBe(true);
    expect(a.tabIds).toEqual(['t1', 't2']);
    expect(b.isShared).toBe(false);
  });

  // Library-only cards are the ones most easily forgotten, so they get a
  // group rather than being dropped.
  it('collects cards that are in no tab into their own group', () => {
    const { nodes, groups } = buildCardGraph({
      cards: { a: customCard('A', '', {}) },
      views,
      viewOrder: ['t1', 't2'],
    });
    expect(nodes[0].groupId).toBe(UNPLACED_GROUP_ID);
    expect(groups.at(-1)).toMatchObject({ id: UNPLACED_GROUP_ID, cardIds: ['a'] });
  });

  it('omits the unplaced group entirely when every card is in a tab', () => {
    const { groups } = buildCardGraph({
      cards: { a: customCard('A', '', { t1: {} }) },
      views,
      viewOrder: ['t1', 't2'],
    });
    expect(groups.map(g => g.id)).toEqual(['t1', 't2']);
  });

  it('ignores a viewOrder entry with no matching view', () => {
    const { groups } = buildCardGraph({
      cards: { a: customCard('A', '', { t1: {} }) },
      views: { t1: { title: 'One' } },
      viewOrder: ['t1', 'deleted'],
    });
    expect(groups.map(g => g.id)).toEqual(['t1']);
  });

  it('returns empty structures for an empty project rather than throwing', () => {
    expect(buildCardGraph()).toEqual({ nodes: [], edges: [], groups: [] });
  });
});
