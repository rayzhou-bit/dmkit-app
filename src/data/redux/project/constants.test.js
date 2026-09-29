import { INTRO_CARDS, INTRO_TABS, INTRO_PROJECT } from './constants';
import { reducer } from './reducers';
import { CARD_TYPES, hasCardContent } from '../../../constants/cards';
import { parseCardRefs } from '../../../utils/cardRefToken';

// These lock in the structural invariants loadIntroProject relies on
// silently - see reducers.js: loadIntroProject does NOT merge DEFAULT_CARD
// over INTRO_CARDS, so a missing field or a dangling card/tab reference
// here would ship straight to every new user with no error anywhere.

describe('INTRO_CARDS <-> INTRO_TABS wiring', () => {
  it('every card id listed in a tab exists in INTRO_CARDS', () => {
    for (const [tabId, tab] of Object.entries(INTRO_TABS)) {
      for (const cardId of tab.cards) {
        expect(INTRO_CARDS[cardId]).toBeDefined();
      }
      void tabId;
    }
  });

  it('every card in INTRO_CARDS is listed by every tab in tab.cards', () => {
    for (const [cardId, card] of Object.entries(INTRO_CARDS)) {
      for (const tabId of Object.keys(card.views)) {
        expect(INTRO_TABS[tabId]).toBeDefined();
        expect(INTRO_TABS[tabId].cards).toContain(cardId);
      }
    }
  });

  it("a card's views keys are exactly the tabs whose cards array lists it (no orphans either direction)", () => {
    for (const [tabId, tab] of Object.entries(INTRO_TABS)) {
      for (const cardId of tab.cards) {
        expect(Object.keys(INTRO_CARDS[cardId].views)).toContain(tabId);
      }
    }
    for (const [cardId, card] of Object.entries(INTRO_CARDS)) {
      for (const tabId of Object.keys(card.views)) {
        expect(INTRO_TABS[tabId].cards).toContain(cardId);
      }
      void cardId;
    }
  });
});

describe('INTRO_CARDS field completeness', () => {
  const cardEntries = Object.entries(INTRO_CARDS);

  it('every card has a non-empty title, a valid type, and a color', () => {
    for (const [id, card] of cardEntries) {
      expect(card.title, `${id}.title`).toBeTruthy();
      expect(Object.values(CARD_TYPES), `${id}.type`).toContain(card.type);
      expect(card.color, `${id}.color`).toBeTruthy();
    }
  });

  it('every card has distinct createdOn/editedOn timestamps, and createdOn <= editedOn', () => {
    const createdOns = cardEntries.map(([, card]) => card.createdOn);
    const editedOns = cardEntries.map(([, card]) => card.editedOn);
    expect(new Set(createdOns).size).toBe(createdOns.length);
    expect(new Set(editedOns).size).toBe(editedOns.length);
    for (const [id, card] of cardEntries) {
      expect(card.createdOn, `${id}.createdOn`).toBeTypeOf('number');
      expect(card.editedOn, `${id}.editedOn`).toBeTypeOf('number');
      expect(card.createdOn, `${id} createdOn <= editedOn`).toBeLessThanOrEqual(card.editedOn);
    }
  });
});

describe('card reference tokens', () => {
  it('every #[title](id) token in any card text resolves to a real card id', () => {
    const cardIds = new Set(Object.keys(INTRO_CARDS));
    for (const [id, card] of Object.entries(INTRO_CARDS)) {
      const texts = [];
      if (card.type === CARD_TYPES.custom) {
        for (const block of card.content.blocks) {
          if (block.type === 'text') texts.push(block.text);
        }
      } else if (card.type === CARD_TYPES.note) {
        texts.push(card.content.description);
        for (const entry of card.content.entries) texts.push(entry.description);
      }
      for (const text of texts) {
        const refs = parseCardRefs(text).filter(seg => seg.type === 'ref');
        for (const ref of refs) {
          expect(cardIds.has(ref.id), `${id} references missing card "${ref.id}"`).toBe(true);
        }
      }
    }
  });
});

describe('INTRO_PROJECT top-level shape', () => {
  it('viewOrder matches the keys of INTRO_TABS, and activeViewId is in viewOrder', () => {
    expect(new Set(INTRO_PROJECT.viewOrder)).toEqual(new Set(Object.keys(INTRO_TABS)));
    expect(INTRO_PROJECT.viewOrder).toContain(INTRO_PROJECT.activeViewId);
  });
});

describe('loadIntroProject through the real reducer', () => {
  it('produces cards that all pass hasCardContent', () => {
    const next = reducer(
      { cards: {}, views: {}, viewOrder: [], activeViewId: null },
      { type: 'project/loadIntroProject' },
    );
    for (const [id, card] of Object.entries(next.cards)) {
      expect(hasCardContent(card.content), `${id} has no content`).toBe(true);
    }
  });
});
