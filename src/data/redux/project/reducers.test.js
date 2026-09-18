import { reducer } from './reducers';

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
