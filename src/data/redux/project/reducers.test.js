import { reducer } from './reducers';
import { buildMonsterContent } from '../../../constants/monster';
import { buildNoteContent } from '../../../constants/note';
import { buildCustomContent } from '../../../constants/custom';
import { DEFAULT_CARD_SIZE, MONSTER_CARD_SIZE, NOTE_CARD_SIZE } from '../../../constants/dimensions';

const baseState = {
  cards: {},
  views: {},
  viewOrder: [],
  activeViewId: 'tabA',
};

describe('createCard', () => {
  it('defaults to a text card when no type is given', () => {
    const next = reducer(baseState, { type: 'project/createCard', payload: { newId: 'c1' } });
    expect(next.cards.c1.type).toBe('text');
    expect(next.cards.c1.content).toEqual({ text: '' });
    expect(next.cards.c1.content.image).toBeUndefined();
  });

  it('creates an image card with the given image/alt', () => {
    const next = reducer(baseState, {
      type: 'project/createCard',
      payload: { newId: 'c1', type: 'image', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
    });
    expect(next.cards.c1.type).toBe('image');
    expect(next.cards.c1.content).toEqual({ image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' });
    expect(next.cards.c1.content.text).toBeUndefined();
  });

  it('defaults image/alt to empty strings, never undefined, when omitted', () => {
    const next = reducer(baseState, {
      type: 'project/createCard',
      payload: { newId: 'c1', type: 'image' },
    });
    const card = next.cards.c1;
    expect(card.content).toEqual({ image: '', alt: '' });
    // Round-trip through JSON (as Firestore effectively does) must be lossless -
    // any `undefined` field would silently vanish here.
    expect(JSON.parse(JSON.stringify(card))).toEqual(card);
  });
});

describe('createCard - monster', () => {
  it('stamps type and content matches buildMonsterContent(), no text/image keys', () => {
    const next = reducer(baseState, { type: 'project/createCard', payload: { newId: 'c1', type: 'monster' } });
    const card = next.cards.c1;
    expect(card.type).toBe('monster');
    expect(card.content).toEqual(buildMonsterContent());
    expect(card.content.text).toBeUndefined();
    expect(card.content.image).toBeUndefined();
    expect(card.content.collapsed).toBeUndefined();
    expect(JSON.parse(JSON.stringify(card))).toEqual(card);
  });

  it('copies fields from the monster payload', () => {
    const next = reducer(baseState, {
      type: 'project/createCard',
      payload: { newId: 'c1', type: 'monster', monster: { creatureType: 'dragon', armorClass: '18' } },
    });
    expect(next.cards.c1.content.creatureType).toBe('dragon');
    expect(next.cards.c1.content.armorClass).toBe('18');
  });
});

describe('createCard - note', () => {
  it('stamps type and content matches buildNoteContent(), no text/image keys', () => {
    const next = reducer(baseState, { type: 'project/createCard', payload: { newId: 'c1', type: 'note' } });
    const card = next.cards.c1;
    expect(card.type).toBe('note');
    expect(card.content).toEqual(buildNoteContent());
    expect(card.content.text).toBeUndefined();
    expect(card.content.image).toBeUndefined();
    expect(JSON.parse(JSON.stringify(card))).toEqual(card);
  });

  it('copies fields from the note payload', () => {
    const next = reducer(baseState, {
      type: 'project/createCard',
      payload: { newId: 'c1', type: 'note', note: { description: 'A dim tavern.', entries: [{ id: 'e1', name: 'Rosa', description: 'Gruff.' }] } },
    });
    expect(next.cards.c1.content.description).toBe('A dim tavern.');
    expect(next.cards.c1.content.entries).toEqual([{ id: 'e1', name: 'Rosa', description: 'Gruff.' }]);
  });
});

describe('createCard - custom', () => {
  it('stamps type and content matches buildCustomContent(), no text/image keys', () => {
    const next = reducer(baseState, { type: 'project/createCard', payload: { newId: 'c1', type: 'custom' } });
    const card = next.cards.c1;
    expect(card.type).toBe('custom');
    expect(card.content).toEqual(buildCustomContent());
    expect(card.content.text).toBeUndefined();
    expect(card.content.image).toBeUndefined();
    expect(JSON.parse(JSON.stringify(card))).toEqual(card);
  });

  it('copies fields from the custom payload', () => {
    const next = reducer(baseState, {
      type: 'project/createCard',
      payload: { newId: 'c1', type: 'custom', custom: { blocks: [{ id: 'b1', type: 'text', text: 'hi' }] } },
    });
    expect(next.cards.c1.content.blocks).toEqual([{ id: 'b1', type: 'text', text: 'hi', image: '', alt: '' }]);
  });
});

describe('updateCardImage', () => {
  const state = {
    ...baseState,
    cards: {
      c1: {
        views: {},
        color: 'gray',
        title: 'untitled',
        content: { text: '' },
        createdOn: 1,
        editedOn: 1,
      },
    },
  };

  it('sets content.image/alt, stamps type: image, and bumps editedOn', () => {
    const next = reducer(state, {
      type: 'project/updateCardImage',
      payload: { id: 'c1', image: 'data:image/jpeg;base64,yyy', alt: 'cat.png' },
    });
    expect(next.cards.c1.content.image).toBe('data:image/jpeg;base64,yyy');
    expect(next.cards.c1.content.alt).toBe('cat.png');
    expect(next.cards.c1.type).toBe('image');
    expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(state.cards.c1.editedOn);
    expect(next.cards.c1.color).toBe('gray');
    expect(next.cards.c1.title).toBe('untitled');
  });
});

describe('updateCardText regression', () => {
  it('still works on a legacy card with no type', () => {
    const state = {
      ...baseState,
      cards: {
        c1: { views: {}, color: 'gray', title: 'untitled', content: { text: 'old' }, createdOn: 1, editedOn: 1 },
      },
    };
    const next = reducer(state, { type: 'project/updateCardText', payload: { id: 'c1', text: 'new' } });
    expect(next.cards.c1.content.text).toBe('new');
    expect(next.cards.c1.type).toBeUndefined();
    expect(next.cards.c1.color).toBe('gray');
  });
});

describe('updateCardMonsterFields', () => {
  const state = {
    ...baseState,
    cards: {
      c1: { views: {}, color: 'gray', title: 'untitled', content: buildMonsterContent(), createdOn: 1, editedOn: 1 },
    },
  };

  it('patches only the given keys, leaving siblings untouched, and bumps editedOn', () => {
    const next = reducer(state, {
      type: 'project/updateCardMonsterFields',
      payload: { id: 'c1', fields: { creatureType: 'dragon', armorClass: '18' } },
    });
    expect(next.cards.c1.content.creatureType).toBe('dragon');
    expect(next.cards.c1.content.armorClass).toBe('18');
    expect(next.cards.c1.content.alignment).toBe('');
    expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(state.cards.c1.editedOn);
  });

  it('ignores unknown keys and coerces undefined to empty string', () => {
    const next = reducer(state, {
      type: 'project/updateCardMonsterFields',
      payload: { id: 'c1', fields: { notARealField: 'junk', speed: undefined } },
    });
    expect(next.cards.c1.content.notARealField).toBeUndefined();
    expect(next.cards.c1.content.speed).toBe('');
  });

  it('ignores notes - it is a block list now (see the custom block reducers), not a plain string', () => {
    const stateWithNotes = { ...state, cards: { c1: { ...state.cards.c1, content: { ...state.cards.c1.content, notes: [{ id: 'n1', type: 'text', text: 'wounded', image: '', alt: '' }] } } } };
    const next = reducer(stateWithNotes, {
      type: 'project/updateCardMonsterFields',
      payload: { id: 'c1', fields: { notes: 'clobbered!' } },
    });
    expect(next.cards.c1.content.notes).toEqual([{ id: 'n1', type: 'text', text: 'wounded', image: '', alt: '' }]);
  });
});

describe('updateCardPortrait', () => {
  const state = {
    ...baseState,
    cards: {
      c1: { views: {}, color: 'gray', title: 'untitled', content: buildMonsterContent({ creatureType: 'dragon' }), createdOn: 1, editedOn: 1 },
    },
  };

  it('sets both keys, bumps editedOn, does not clobber other fields', () => {
    const next = reducer(state, {
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: 'data:image/jpeg;base64,xxx', portraitAlt: 'dragon.png' },
    });
    expect(next.cards.c1.content.portrait).toBe('data:image/jpeg;base64,xxx');
    expect(next.cards.c1.content.portraitAlt).toBe('dragon.png');
    expect(next.cards.c1.content.creatureType).toBe('dragon');
    expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(state.cards.c1.editedOn);
  });

  it('clears the portrait when set back to empty strings', () => {
    const withPortrait = reducer(state, {
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: 'data:image/jpeg;base64,xxx', portraitAlt: 'dragon.png' },
    });
    const cleared = reducer(withPortrait, {
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: '', portraitAlt: '' },
    });
    expect(cleared.cards.c1.content.portrait).toBe('');
    expect(cleared.cards.c1.content.portraitAlt).toBe('');
  });
});

describe('updateCardNoteFields', () => {
  const state = {
    ...baseState,
    cards: {
      c1: { views: {}, color: 'gray', title: 'untitled', content: buildNoteContent(), createdOn: 1, editedOn: 1 },
    },
  };

  it('patches description, leaves entries untouched, bumps editedOn', () => {
    const next = reducer(state, {
      type: 'project/updateCardNoteFields',
      payload: { id: 'c1', fields: { description: 'A dim tavern.' } },
    });
    expect(next.cards.c1.content.description).toBe('A dim tavern.');
    expect(next.cards.c1.content.entries).toEqual([]);
    expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(state.cards.c1.editedOn);
  });

  it('ignores unknown keys and coerces undefined to empty string', () => {
    const next = reducer(state, {
      type: 'project/updateCardNoteFields',
      payload: { id: 'c1', fields: { notARealField: 'junk', description: undefined } },
    });
    expect(next.cards.c1.content.notARealField).toBeUndefined();
    expect(next.cards.c1.content.description).toBe('');
  });
});

describe('linkCardToView', () => {
  it.each([
    ['text', { type: 'text', content: {} }, DEFAULT_CARD_SIZE],
    ['monster', { type: 'monster', content: buildMonsterContent() }, MONSTER_CARD_SIZE],
    ['note', { type: 'note', content: buildNoteContent() }, NOTE_CARD_SIZE],
    ['custom', { type: 'custom', content: buildCustomContent() }, DEFAULT_CARD_SIZE],
  ])('sizes a %s card by its type', (_, card, expectedSize) => {
    const state = { ...baseState, cards: { c1: { ...card, views: {} } } };
    const next = reducer(state, {
      type: 'project/linkCardToView',
      payload: { id: 'c1', position: { x: 0, y: 0 } },
    });
    expect(next.cards.c1.views.tabA.size).toEqual(expectedSize);
  });
});

describe('destroyCards', () => {
  it('removes every listed id, leaving the rest untouched', () => {
    const state = {
      ...baseState,
      cards: {
        c1: { views: { tabA: { pos: { x: 0, y: 0 }, size: {} } } },
        c2: { views: { tabA: { pos: { x: 12, y: 0 }, size: {} } } },
        c3: { views: { tabA: { pos: { x: 24, y: 0 }, size: {} } } },
      },
    };
    const next = reducer(state, { type: 'project/destroyCards', payload: { ids: ['c1', 'c3'] } });
    expect(next.cards.c1).toBeUndefined();
    expect(next.cards.c3).toBeUndefined();
    expect(next.cards.c2).toBeDefined();
  });
});

describe('moveCards', () => {
  const state = {
    ...baseState,
    cards: {
      c1: { views: { tabA: { pos: { x: 0, y: 0 }, size: {} } } },
      c2: { views: { tabA: { pos: { x: 24, y: 36 }, size: {} } } },
      c3: { views: {} }, // not on the active tab - must be skipped
    },
  };

  it('applies the same delta to every id, grid-snapped', () => {
    const next = reducer(state, {
      type: 'project/moveCards',
      payload: { ids: ['c1', 'c2'], delta: { x: 10, y: 5 } },
    });
    // (0+10, 0+5) snapped to GRID_SIZE(12) -> (12, 0)
    expect(next.cards.c1.views.tabA.pos).toEqual({ x: 12, y: 0 });
    // (24+10, 36+5) -> (34, 41) snapped -> (36, 36)
    expect(next.cards.c2.views.tabA.pos).toEqual({ x: 36, y: 36 });
  });

  it('skips ids with no view on the active tab', () => {
    const next = reducer(state, {
      type: 'project/moveCards',
      payload: { ids: ['c3'], delta: { x: 10, y: 10 } },
    });
    expect(next.cards.c3).toEqual(state.cards.c3);
  });

  it('is a no-op when there is no active tab', () => {
    const noTabState = { ...state, activeViewId: null };
    const next = reducer(noTabState, {
      type: 'project/moveCards',
      payload: { ids: ['c1'], delta: { x: 10, y: 10 } },
    });
    expect(next).toBe(noTabState);
  });
});

describe('destroyTab', () => {
  it('cascades: removes the tab from every card that referenced it', () => {
    const state = {
      cards: {
        c1: { views: { tabA: { pos: { x: 0, y: 0 }, size: {} }, tabB: {} } },
        c2: { views: { tabB: {} } },
      },
      views: { tabA: {}, tabB: {} },
      viewOrder: ['tabA', 'tabB'],
      activeViewId: 'tabB',
    };

    const next = reducer(state, { type: 'project/destroyTab', payload: { id: 'tabA' } });

    expect(next.views.tabA).toBeUndefined();
    expect(next.cards.c1.views.tabA).toBeUndefined();
    expect(next.cards.c1.views.tabB).toEqual({}); // untouched placement survives
    expect(next.cards.c2.views).toEqual({ tabB: {} }); // unrelated card untouched
  });
});

describe('monster entry-list reducers', () => {
  const baseMonsterState = {
    cards: {
      c1: {
        views: {},
        content: {
          ...buildMonsterContent(),
          actions: [
            { id: 'e1', name: 'Scimitar', description: 'Slash.' },
            { id: 'e2', name: 'Bow', description: 'Pierce.' },
          ],
        },
        editedOn: 1,
      },
    },
    views: {},
    viewOrder: [],
    activeViewId: 'tabA',
  };

  describe('addMonsterEntry', () => {
    it('appends a blank entry, leaves siblings/other cards untouched, bumps editedOn', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/addMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e3' },
      });
      expect(next.cards.c1.content.actions).toEqual([
        { id: 'e1', name: 'Scimitar', description: 'Slash.' },
        { id: 'e2', name: 'Bow', description: 'Pierce.' },
        { id: 'e3', name: '', description: '' },
      ]);
      expect(next.cards.c1.content.traits).toEqual([]); // untouched sibling field
      expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(1);
    });

    it('is a no-op for an unknown field (not an entry field)', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/addMonsterEntry',
        payload: { id: 'c1', field: 'size', entryId: 'e3' },
      });
      expect(next).toBe(baseMonsterState);
    });

    it('is a no-op for an unknown card id', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/addMonsterEntry',
        payload: { id: 'nope', field: 'actions', entryId: 'e3' },
      });
      expect(next).toBe(baseMonsterState);
    });

    it('is a no-op at the per-section cap', () => {
      const manyEntries = Array.from({ length: 50 }, (_, i) => ({ id: `e${i}`, name: '', description: '' }));
      const atCapState = { ...baseMonsterState, cards: { c1: { ...baseMonsterState.cards.c1, content: { ...baseMonsterState.cards.c1.content, actions: manyEntries } } } };
      const next = reducer(atCapState, {
        type: 'project/addMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'overflow' },
      });
      expect(next).toBe(atCapState);
    });

    it('normalizes a legacy string field before appending', () => {
      const legacyState = { ...baseMonsterState, cards: { c1: { ...baseMonsterState.cards.c1, content: { ...baseMonsterState.cards.c1.content, actions: 'Old free text' } } } };
      const next = reducer(legacyState, {
        type: 'project/addMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e3' },
      });
      expect(next.cards.c1.content.actions).toEqual([
        { id: 'legacy', name: '', description: 'Old free text' },
        { id: 'e3', name: '', description: '' },
      ]);
    });
  });

  describe('duplicateMonsterEntry', () => {
    it('inserts a copy right after the source, with the new id', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/duplicateMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e1', newEntryId: 'e1-copy' },
      });
      expect(next.cards.c1.content.actions).toEqual([
        { id: 'e1', name: 'Scimitar', description: 'Slash.' },
        { id: 'e1-copy', name: 'Scimitar', description: 'Slash.' },
        { id: 'e2', name: 'Bow', description: 'Pierce.' },
      ]);
      // source untouched
      expect(baseMonsterState.cards.c1.content.actions).toEqual([
        { id: 'e1', name: 'Scimitar', description: 'Slash.' },
        { id: 'e2', name: 'Bow', description: 'Pierce.' },
      ]);
    });

    it('is a no-op for an unknown entryId', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/duplicateMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'nope', newEntryId: 'e3' },
      });
      expect(next).toBe(baseMonsterState);
    });
  });

  describe('deleteMonsterEntry', () => {
    it('removes only the targeted entry, preserving order of the rest', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/deleteMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e1' },
      });
      expect(next.cards.c1.content.actions).toEqual([
        { id: 'e2', name: 'Bow', description: 'Pierce.' },
      ]);
    });

    it('is a no-op for an unknown entryId', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/deleteMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'nope' },
      });
      expect(next).toBe(baseMonsterState);
    });
  });

  describe('updateMonsterEntry', () => {
    it('patches only the named key on only the named entry', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/updateMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e2', changes: { name: 'Longbow' } },
      });
      expect(next.cards.c1.content.actions).toEqual([
        { id: 'e1', name: 'Scimitar', description: 'Slash.' },
        { id: 'e2', name: 'Longbow', description: 'Pierce.' },
      ]);
    });

    it('ignores keys other than name/description', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/updateMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e1', changes: { id: 'hacked', name: 'Rapier' } },
      });
      expect(next.cards.c1.content.actions[0]).toEqual({ id: 'e1', name: 'Rapier', description: 'Slash.' });
    });

    it('coerces an undefined value to ""', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/updateMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'e1', changes: { description: undefined } },
      });
      expect(next.cards.c1.content.actions[0].description).toBe('');
    });

    it('is a no-op for an unknown entryId', () => {
      const next = reducer(baseMonsterState, {
        type: 'project/updateMonsterEntry',
        payload: { id: 'c1', field: 'actions', entryId: 'nope', changes: { name: 'x' } },
      });
      expect(next).toBe(baseMonsterState);
    });
  });
});

describe('note entry-list reducers', () => {
  const baseNoteState = {
    cards: {
      c1: {
        views: {},
        content: {
          ...buildNoteContent(),
          entries: [
            { id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
            { id: 'e2', name: 'Hidden trapdoor', description: 'Behind the bar.' },
          ],
        },
        editedOn: 1,
      },
    },
    views: {},
    viewOrder: [],
    activeViewId: 'tabA',
  };

  describe('addNoteEntry', () => {
    it('appends a blank entry, bumps editedOn', () => {
      const next = reducer(baseNoteState, {
        type: 'project/addNoteEntry',
        payload: { id: 'c1', entryId: 'e3' },
      });
      expect(next.cards.c1.content.entries).toEqual([
        { id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
        { id: 'e2', name: 'Hidden trapdoor', description: 'Behind the bar.' },
        { id: 'e3', name: '', description: '' },
      ]);
      expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(1);
    });

    it('is a no-op for an unknown card id', () => {
      const next = reducer(baseNoteState, {
        type: 'project/addNoteEntry',
        payload: { id: 'nope', entryId: 'e3' },
      });
      expect(next).toBe(baseNoteState);
    });

    it('is a no-op at the entry cap', () => {
      const manyEntries = Array.from({ length: 50 }, (_, i) => ({ id: `e${i}`, name: '', description: '' }));
      const atCapState = { ...baseNoteState, cards: { c1: { ...baseNoteState.cards.c1, content: { ...baseNoteState.cards.c1.content, entries: manyEntries } } } };
      const next = reducer(atCapState, {
        type: 'project/addNoteEntry',
        payload: { id: 'c1', entryId: 'overflow' },
      });
      expect(next).toBe(atCapState);
    });
  });

  describe('duplicateNoteEntry', () => {
    it('inserts a copy right after the source, with the new id', () => {
      const next = reducer(baseNoteState, {
        type: 'project/duplicateNoteEntry',
        payload: { id: 'c1', entryId: 'e1', newEntryId: 'e1-copy' },
      });
      expect(next.cards.c1.content.entries).toEqual([
        { id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
        { id: 'e1-copy', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
        { id: 'e2', name: 'Hidden trapdoor', description: 'Behind the bar.' },
      ]);
      // source untouched
      expect(baseNoteState.cards.c1.content.entries).toEqual([
        { id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
        { id: 'e2', name: 'Hidden trapdoor', description: 'Behind the bar.' },
      ]);
    });

    it('is a no-op for an unknown entryId', () => {
      const next = reducer(baseNoteState, {
        type: 'project/duplicateNoteEntry',
        payload: { id: 'c1', entryId: 'nope', newEntryId: 'e3' },
      });
      expect(next).toBe(baseNoteState);
    });
  });

  describe('deleteNoteEntry', () => {
    it('removes only the targeted entry, preserving order of the rest', () => {
      const next = reducer(baseNoteState, {
        type: 'project/deleteNoteEntry',
        payload: { id: 'c1', entryId: 'e1' },
      });
      expect(next.cards.c1.content.entries).toEqual([
        { id: 'e2', name: 'Hidden trapdoor', description: 'Behind the bar.' },
      ]);
    });

    it('is a no-op for an unknown entryId', () => {
      const next = reducer(baseNoteState, {
        type: 'project/deleteNoteEntry',
        payload: { id: 'c1', entryId: 'nope' },
      });
      expect(next).toBe(baseNoteState);
    });
  });

  describe('updateNoteEntry', () => {
    it('patches only the named key on only the named entry', () => {
      const next = reducer(baseNoteState, {
        type: 'project/updateNoteEntry',
        payload: { id: 'c1', entryId: 'e2', changes: { name: 'Secret trapdoor' } },
      });
      expect(next.cards.c1.content.entries).toEqual([
        { id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
        { id: 'e2', name: 'Secret trapdoor', description: 'Behind the bar.' },
      ]);
    });

    it('ignores keys other than name/description', () => {
      const next = reducer(baseNoteState, {
        type: 'project/updateNoteEntry',
        payload: { id: 'c1', entryId: 'e1', changes: { id: 'hacked', name: 'Rosa' } },
      });
      expect(next.cards.c1.content.entries[0]).toEqual({ id: 'e1', name: 'Rosa', description: 'Gruff but fair.' });
    });

    it('coerces an undefined value to ""', () => {
      const next = reducer(baseNoteState, {
        type: 'project/updateNoteEntry',
        payload: { id: 'c1', entryId: 'e1', changes: { description: undefined } },
      });
      expect(next.cards.c1.content.entries[0].description).toBe('');
    });

    it('is a no-op for an unknown entryId', () => {
      const next = reducer(baseNoteState, {
        type: 'project/updateNoteEntry',
        payload: { id: 'c1', entryId: 'nope', changes: { name: 'x' } },
      });
      expect(next).toBe(baseNoteState);
    });
  });
});

describe('custom block reducers', () => {
  const baseCustomState = {
    cards: {
      c1: {
        views: {},
        type: 'custom',
        content: {
          ...buildCustomContent(),
          blocks: [
            { id: 'b1', type: 'text', text: 'Some notes.', image: '', alt: '' },
            { id: 'b2', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
          ],
        },
        editedOn: 1,
      },
    },
    views: {},
    viewOrder: [],
    activeViewId: 'tabA',
  };

  describe('addCustomBlock', () => {
    it('appends a blank text block, bumps editedOn', () => {
      const next = reducer(baseCustomState, {
        type: 'project/addCustomBlock',
        payload: { id: 'c1', blockId: 'b3', blockType: 'text' },
      });
      expect(next.cards.c1.content.blocks).toEqual([
        { id: 'b1', type: 'text', text: 'Some notes.', image: '', alt: '' },
        { id: 'b2', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
        { id: 'b3', type: 'text', text: '', image: '', alt: '' },
      ]);
      expect(next.cards.c1.editedOn).toBeGreaterThanOrEqual(1);
    });

    it('appends a blank image block', () => {
      const next = reducer(baseCustomState, {
        type: 'project/addCustomBlock',
        payload: { id: 'c1', blockId: 'b3', blockType: 'image' },
      });
      expect(next.cards.c1.content.blocks[2]).toEqual({ id: 'b3', type: 'image', text: '', image: '', alt: '' });
    });

    it('is a no-op for an unknown card id', () => {
      const next = reducer(baseCustomState, {
        type: 'project/addCustomBlock',
        payload: { id: 'nope', blockId: 'b3', blockType: 'text' },
      });
      expect(next).toBe(baseCustomState);
    });

    it('is a no-op at the block cap (combined across both types)', () => {
      const manyBlocks = Array.from({ length: 50 }, (_, i) => ({ id: `b${i}`, type: 'text', text: '', image: '', alt: '' }));
      const atCapState = { ...baseCustomState, cards: { c1: { ...baseCustomState.cards.c1, content: { ...baseCustomState.cards.c1.content, blocks: manyBlocks } } } };
      const next = reducer(atCapState, {
        type: 'project/addCustomBlock',
        payload: { id: 'c1', blockId: 'overflow', blockType: 'image' },
      });
      expect(next).toBe(atCapState);
    });
  });

  describe('duplicateCustomBlock', () => {
    it('inserts a copy right after the source, with the new id, preserving its type', () => {
      const next = reducer(baseCustomState, {
        type: 'project/duplicateCustomBlock',
        payload: { id: 'c1', blockId: 'b2', newBlockId: 'b2-copy' },
      });
      expect(next.cards.c1.content.blocks).toEqual([
        { id: 'b1', type: 'text', text: 'Some notes.', image: '', alt: '' },
        { id: 'b2', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
        { id: 'b2-copy', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
      ]);
      // source untouched
      expect(baseCustomState.cards.c1.content.blocks).toHaveLength(2);
    });

    it('is a no-op for an unknown blockId', () => {
      const next = reducer(baseCustomState, {
        type: 'project/duplicateCustomBlock',
        payload: { id: 'c1', blockId: 'nope', newBlockId: 'b3' },
      });
      expect(next).toBe(baseCustomState);
    });
  });

  describe('deleteCustomBlock', () => {
    it('removes only the targeted block, preserving order of the rest', () => {
      const next = reducer(baseCustomState, {
        type: 'project/deleteCustomBlock',
        payload: { id: 'c1', blockId: 'b1' },
      });
      expect(next.cards.c1.content.blocks).toEqual([
        { id: 'b2', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
      ]);
    });

    it('is a no-op for an unknown blockId', () => {
      const next = reducer(baseCustomState, {
        type: 'project/deleteCustomBlock',
        payload: { id: 'c1', blockId: 'nope' },
      });
      expect(next).toBe(baseCustomState);
    });
  });

  describe('updateCustomTextBlock', () => {
    it('patches the text on a text block', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomTextBlock',
        payload: { id: 'c1', blockId: 'b1', text: 'Updated notes.' },
      });
      expect(next.cards.c1.content.blocks[0].text).toBe('Updated notes.');
    });

    it('is a no-op when the targeted block is an image block (wrong type)', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomTextBlock',
        payload: { id: 'c1', blockId: 'b2', text: 'should not apply' },
      });
      expect(next).toBe(baseCustomState);
    });

    it('coerces an undefined value to ""', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomTextBlock',
        payload: { id: 'c1', blockId: 'b1', text: undefined },
      });
      expect(next.cards.c1.content.blocks[0].text).toBe('');
    });

    it('is a no-op for an unknown blockId', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomTextBlock',
        payload: { id: 'c1', blockId: 'nope', text: 'x' },
      });
      expect(next).toBe(baseCustomState);
    });
  });

  describe('updateCustomImageBlock', () => {
    it('patches image/alt on an image block, and never touches the card\'s own type', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomImageBlock',
        payload: { id: 'c1', blockId: 'b2', image: 'data:image/jpeg;base64,new', alt: 'new.png' },
      });
      expect(next.cards.c1.content.blocks[1]).toEqual({ id: 'b2', type: 'image', text: '', image: 'data:image/jpeg;base64,new', alt: 'new.png' });
      // The regression this whole feature exists to prevent: unlike
      // updateCardImage, this must never stamp the card's own `type`.
      expect(next.cards.c1.type).toBe('custom');
    });

    it('is a no-op when the targeted block is a text block (wrong type)', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomImageBlock',
        payload: { id: 'c1', blockId: 'b1', image: 'data:...', alt: 'x' },
      });
      expect(next).toBe(baseCustomState);
    });

    it('is a no-op for an unknown blockId', () => {
      const next = reducer(baseCustomState, {
        type: 'project/updateCustomImageBlock',
        payload: { id: 'c1', blockId: 'nope', image: 'data:...', alt: 'x' },
      });
      expect(next).toBe(baseCustomState);
    });
  });
});

// Same 5 actions, targeting content.notes on a monster card via an explicit
// field: 'notes' payload key - proves the applyCustomBlocks generalization
// works for a second field/card type, and specifically that it never loses
// a legacy string value along the way (the one regression this whole
// feature exists to prevent).
describe('custom block reducers - field: "notes" on a monster card', () => {
  const baseMonsterNotesState = {
    cards: {
      c1: {
        views: {},
        type: 'monster',
        content: {
          notes: [
            { id: 'n1', type: 'text', text: 'Wounded, flees at 50hp.', image: '', alt: '' },
            { id: 'n2', type: 'image', text: '', image: 'data:image/jpeg;base64,xxx', alt: 'lair.png' },
          ],
        },
        editedOn: 1,
      },
    },
    views: {},
    viewOrder: [],
    activeViewId: 'tabA',
  };

  it('addCustomBlock appends to content.notes, not content.blocks', () => {
    const next = reducer(baseMonsterNotesState, {
      type: 'project/addCustomBlock',
      payload: { id: 'c1', blockId: 'n3', blockType: 'text', field: 'notes' },
    });
    expect(next.cards.c1.content.notes).toHaveLength(3);
    expect(next.cards.c1.content.notes[2]).toEqual({ id: 'n3', type: 'text', text: '', image: '', alt: '' });
    expect(next.cards.c1.content.blocks).toBeUndefined();
  });

  it('duplicateCustomBlock/deleteCustomBlock/updateCustomTextBlock/updateCustomImageBlock all target content.notes', () => {
    let next = reducer(baseMonsterNotesState, {
      type: 'project/duplicateCustomBlock',
      payload: { id: 'c1', blockId: 'n1', newBlockId: 'n1-copy', field: 'notes' },
    });
    expect(next.cards.c1.content.notes).toHaveLength(3);
    expect(next.cards.c1.content.notes[1]).toMatchObject({ id: 'n1-copy', text: 'Wounded, flees at 50hp.' });

    next = reducer(baseMonsterNotesState, {
      type: 'project/deleteCustomBlock',
      payload: { id: 'c1', blockId: 'n2', field: 'notes' },
    });
    expect(next.cards.c1.content.notes).toEqual([{ id: 'n1', type: 'text', text: 'Wounded, flees at 50hp.', image: '', alt: '' }]);

    next = reducer(baseMonsterNotesState, {
      type: 'project/updateCustomTextBlock',
      payload: { id: 'c1', blockId: 'n1', text: 'Recovered.', field: 'notes' },
    });
    expect(next.cards.c1.content.notes[0].text).toBe('Recovered.');

    next = reducer(baseMonsterNotesState, {
      type: 'project/updateCustomImageBlock',
      payload: { id: 'c1', blockId: 'n2', image: 'data:image/jpeg;base64,new', alt: 'new.png', field: 'notes' },
    });
    expect(next.cards.c1.content.notes[1]).toEqual({ id: 'n2', type: 'image', text: '', image: 'data:image/jpeg;base64,new', alt: 'new.png' });
    // Never the regression this feature exists to prevent - the card's own
    // type is untouched by an image block update.
    expect(next.cards.c1.type).toBe('monster');
  });

  it('is a no-op for an unrecognized field (not just missing card/blockId)', () => {
    const next = reducer(baseMonsterNotesState, {
      type: 'project/addCustomBlock',
      payload: { id: 'c1', blockId: 'n3', blockType: 'text', field: 'notARealField' },
    });
    expect(next).toBe(baseMonsterNotesState);
  });

  // The regression the whole feature exists to prevent: a card whose notes
  // is still a legacy plain string (as it would be straight out of
  // Firestore, unnormalized, per normalizeMonsterEntries's own doc comment)
  // must not have that text silently discarded the first time any block
  // action runs against it.
  describe('legacy plain-string content.notes is never silently discarded', () => {
    const legacyState = {
      ...baseMonsterNotesState,
      cards: { c1: { ...baseMonsterNotesState.cards.c1, content: { notes: 'Lair is flooded.' } } },
    };

    it('addCustomBlock preserves the legacy text as the first block', () => {
      const next = reducer(legacyState, {
        type: 'project/addCustomBlock',
        payload: { id: 'c1', blockId: 'n2', blockType: 'text', field: 'notes' },
      });
      expect(next.cards.c1.content.notes[0]).toMatchObject({ id: 'legacy', text: 'Lair is flooded.' });
      expect(next.cards.c1.content.notes).toHaveLength(2);
    });

    it('duplicateCustomBlock preserves the legacy text', () => {
      const next = reducer(legacyState, {
        type: 'project/duplicateCustomBlock',
        payload: { id: 'c1', blockId: 'legacy', newBlockId: 'copy', field: 'notes' },
      });
      expect(next.cards.c1.content.notes[0].text).toBe('Lair is flooded.');
      expect(next.cards.c1.content.notes[1]).toMatchObject({ id: 'copy', text: 'Lair is flooded.' });
    });

    it('deleteCustomBlock (of a different, nonexistent id) is a true no-op, leaving the legacy string untouched', () => {
      const next = reducer(legacyState, {
        type: 'project/deleteCustomBlock',
        payload: { id: 'c1', blockId: 'nope', field: 'notes' },
      });
      expect(next).toBe(legacyState);
      expect(next.cards.c1.content.notes).toBe('Lair is flooded.');
    });

    it('updateCustomTextBlock on the legacy block edits it in place, text preserved through normalization', () => {
      const next = reducer(legacyState, {
        type: 'project/updateCustomTextBlock',
        payload: { id: 'c1', blockId: 'legacy', text: 'Lair is flooded. Watch for eels.', field: 'notes' },
      });
      expect(next.cards.c1.content.notes).toEqual([
        { id: 'legacy', type: 'text', text: 'Lair is flooded. Watch for eels.', image: '', alt: '' },
      ]);
    });

    it('updateCustomImageBlock (targeting a nonexistent image block) leaves the legacy text intact, no-ops', () => {
      const next = reducer(legacyState, {
        type: 'project/updateCustomImageBlock',
        payload: { id: 'c1', blockId: 'legacy', image: 'data:...', alt: 'x', field: 'notes' },
      });
      expect(next).toBe(legacyState);
    });
  });
});
