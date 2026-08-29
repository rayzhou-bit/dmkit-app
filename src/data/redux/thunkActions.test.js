// database.js (imported transitively by hooks.js, not this file) pulls in
// Firebase; thunkActions.js itself has no such import, so no mock is needed
// here.
import { copySelectedCard, copySelectedCards, createNewCard } from './thunkActions';

// Hand-rolled dispatch recorder - thunkActions dispatch plain actions
// synchronously, no store/state read-back needed.
const makeDispatch = () => {
  const dispatched = [];
  const dispatch = (action) => { dispatched.push(action); return action; };
  return { dispatch, dispatched };
};

describe('copySelectedCard', () => {
  it('activates the new copy, leaving the original as-is', () => {
    const { dispatch, dispatched } = makeDispatch();
    const selectedCard = {
      views: { tab1: { pos: { x: 10, y: 20 }, size: { width: 100, height: 100 } } },
      color: 'gray',
      title: 'original',
      content: { text: 'hi' },
    };

    copySelectedCard({ selectedCard, activeTab: 'tab1' })(dispatch);

    const createAction = dispatched.find(a => a.type === 'project/createCard');
    const activateAction = dispatched.find(a => a.type === 'session/setActiveCard');
    expect(createAction).toBeDefined();
    expect(activateAction).toBeDefined();
    expect(activateAction.payload.id).toBe(createAction.payload.newId);
  });
});

describe('copySelectedCards', () => {
  const activeTab = 'tab1';
  const cardA = {
    views: { tab1: { pos: { x: 0, y: 0 }, size: { width: 100, height: 100 } } },
    color: 'gray',
    title: 'A',
    content: { text: 'a' },
  };
  const cardB = {
    views: { tab1: { pos: { x: 200, y: 200 }, size: { width: 100, height: 100 } } },
    color: 'blue',
    title: 'B',
    content: { text: 'b' },
  };

  it('creates a copy of every selected card', () => {
    const { dispatch, dispatched } = makeDispatch();
    copySelectedCards({ selectedCards: [cardA, cardB], activeTab })(dispatch);

    const createActions = dispatched.filter(a => a.type === 'project/createCard');
    expect(createActions).toHaveLength(2);
    expect(createActions[0].payload.title).toBe('A');
    expect(createActions[1].payload.title).toBe('B');
  });

  it('selects the new copies afterward, same idea as the single-copy activation', () => {
    const { dispatch, dispatched } = makeDispatch();
    copySelectedCards({ selectedCards: [cardA, cardB], activeTab })(dispatch);

    const createActions = dispatched.filter(a => a.type === 'project/createCard');
    const selectAction = dispatched.find(a => a.type === 'session/setSelectedCards');
    expect(selectAction).toBeDefined();
    expect(selectAction.payload.cards).toEqual(createActions.map(a => a.payload.newId));
    // dispatched last, after every copy has been created.
    expect(dispatched[dispatched.length - 1]).toBe(selectAction);
  });

  it('selects nothing (clears the old selection) when there is nothing to copy', () => {
    const { dispatch, dispatched } = makeDispatch();
    copySelectedCards({ selectedCards: [], activeTab })(dispatch);

    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]).toEqual({ type: 'session/setSelectedCards', payload: { cards: [] } });
  });
});
