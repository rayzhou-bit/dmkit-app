import { parseCardRefs } from './cardRefToken';
import { getCardType, CARD_TYPES } from '../constants/cards';
import { normalizeCustomBlocks, CUSTOM_BLOCK_TYPES } from '../constants/custom';
import { normalizeNotesBlocks } from '../constants/monster';
import { normalizeMonsterEntries } from '../constants/monster';

// Every surface a #[Title](id) token can actually live in today - the four
// components wired through CardRefField (CustomTextBlock, MonsterNotes via
// CustomBlockList, NoteTextField, NoteEntry's description). A field missing
// from here is an edge the graph silently won't draw, so this list has to
// grow whenever another field gains reference support. Note entry *names*
// are deliberately absent: they're short titles, not prose, and don't
// render refs (see NoteEntry).
export const collectRefText = (card) => {
  const type = getCardType(card);
  const content = card?.content;

  if (type === CARD_TYPES.custom) {
    return normalizeCustomBlocks(content?.blocks)
      .filter(block => block.type === CUSTOM_BLOCK_TYPES.text)
      .map(block => block.text);
  }
  if (type === CARD_TYPES.monster) {
    return normalizeNotesBlocks(content?.notes)
      .filter(block => block.type === CUSTOM_BLOCK_TYPES.text)
      .map(block => block.text);
  }
  if (type === CARD_TYPES.note) {
    return [
      String(content?.description ?? ''),
      ...normalizeMonsterEntries(content?.entries).map(entry => entry.description),
    ];
  }
  // Legacy text/image cards are migrated to custom at every load path, so
  // this only catches data that never reached a reducer.
  return [String(content?.text ?? '')];
};

// Directed card -> card edges, from refs only. Deduped (two tokens pointing
// at the same card are one relationship, not two), self-references dropped
// (a loop tells the reader nothing), and edges to a deleted card dropped -
// CardRefDisplay renders those as dangling chips, but there's no node to
// draw a line to.
const buildEdges = (cards) => {
  const seen = new Set();
  const edges = [];

  for (const [sourceId, card] of Object.entries(cards)) {
    for (const text of collectRefText(card)) {
      for (const segment of parseCardRefs(text)) {
        if (segment.type !== 'ref') continue;
        const targetId = segment.id;
        if (targetId === sourceId) continue;
        if (!cards[targetId]) continue;
        const key = `${sourceId}\u0000${targetId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ source: sourceId, target: targetId });
      }
    }
  }
  return edges;
};

// Which tabs a card is placed in, in viewOrder order so "first tab" is
// stable and matches what the tab bar shows rather than object key order.
const tabsForCard = (card, viewOrder) =>
  viewOrder.filter(viewId => Object.prototype.hasOwnProperty.call(card?.views ?? {}, viewId));

export const UNPLACED_GROUP_ID = '__unplaced__';

// The whole graph model, derived fresh from project state - nothing here is
// persisted, so it can never drift from the cards it describes.
//
// A tab is a set, not a box: `groups[].cardIds` is full membership, so a card
// placed in three tabs appears in all three. `primaryTabId` exists only to
// give the layout a deterministic place to put that card's single dot - it is
// not ownership, and nothing should read it as "the tab this card is in".
export const buildCardGraph = ({ cards = {}, views = {}, viewOrder = [] } = {}) => {
  const order = viewOrder.filter(viewId => views[viewId]);

  const nodes = Object.entries(cards).map(([id, card]) => {
    const tabIds = tabsForCard(card, order);
    return {
      id,
      title: card?.title ?? '',
      color: card?.color ?? 'gray',
      type: getCardType(card),
      tabIds,
      primaryTabId: tabIds[0] ?? UNPLACED_GROUP_ID,
      isShared: tabIds.length > 1,
    };
  });

  const groups = order.map(viewId => ({
    id: viewId,
    title: views[viewId]?.title ?? '',
    cardIds: nodes.filter(node => node.tabIds.includes(viewId)).map(node => node.id),
  }));

  // Cards that exist only in the Library still belong on the graph - they're
  // the ones most easily forgotten about.
  const unplaced = nodes.filter(node => !node.tabIds.length);
  if (unplaced.length) {
    groups.push({ id: UNPLACED_GROUP_ID, title: 'Not in a tab', cardIds: unplaced.map(node => node.id) });
  }

  return { nodes, edges: buildEdges(cards), groups };
};
