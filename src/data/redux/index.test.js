// database.js (imported transitively via project/index.js's api usage in
// hooks, not this file) pulls in Firebase - this file itself doesn't touch
// it, so no mock needed.
import store, { actions, undo, redo } from './index';

describe('undo history vs. filtered (non-undoable) actions', () => {
  it('a filtered action between two undoable ones is not reverted by undoing the second', () => {
    // Regression test: redux-undo's default syncFilter:false keeps
    // _latestUnfiltered pinned to the state from BEFORE any filtered
    // actions, so the next undoable insert pushes that stale snapshot -
    // undoing then jumps back past the filtered action too, not just the
    // undoable one. syncFilter:true (index.js) keeps it current instead.
    store.dispatch(actions.project.updateProjectTitle({ title: 'first' }));
    store.dispatch(actions.project.setActiveTab({ id: 'some-tab' })); // filtered, see actionsToRemove
    store.dispatch(actions.project.updateProjectTitle({ title: 'second' }));

    undo();

    const present = store.getState().project.present;
    expect(present.title).toBe('first'); // the undoable action was reverted
    expect(present.activeViewId).toBe('some-tab'); // the filtered one was not
  });
});

describe('undo history vs. monster-card session state', () => {
  it('undo after a collapse toggle with no intervening edit leaves the toggle intact', () => {
    // This exact sequence - toggle as the LAST dispatch before undo, no
    // undoable action after it - is what the old project-slice collapse
    // action got wrong (redux-undo would silently revert the toggle too).
    store.dispatch(actions.project.setActiveTab({ id: 'mtab' }));
    store.dispatch(actions.project.createCard({ newId: 'mcard', type: 'monster' }));
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'mcard', fields: { creatureType: 'second' } })); // undoable
    store.dispatch(actions.session.setMonsterCollapsed({ id: 'mcard', key: 'identity', collapsed: true })); // session, not undo-tracked

    undo();

    const state = store.getState();
    expect(state.project.present.cards.mcard.content.creatureType).toBe(''); // the undoable edit was reverted
    expect(state.session.monsterCollapse.mcard.identity).toBe(true); // the session toggle survived
  });

  it('updateCardPortrait is also undoable', () => {
    store.dispatch(actions.project.updateCardPortrait({ id: 'mcard', portrait: 'data:x', portraitAlt: 'x.png' }));
    undo();
    expect(store.getState().project.present.cards.mcard.content.portrait).toBe('');
  });

  it('same for a column-collapse toggle', () => {
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'mcard', fields: { creatureType: 'third' } })); // undoable
    store.dispatch(actions.session.setMonsterCollapsed({ id: 'mcard', key: 'combat', collapsed: true })); // session, not undo-tracked

    undo();

    const state = store.getState();
    expect(state.project.present.cards.mcard.content.creatureType).toBe(''); // the undoable edit was reverted
    expect(state.session.monsterCollapse.mcard.combat).toBe(true); // the session toggle survived
  });
});

describe('undo history vs. monster entry-list actions', () => {
  it('setup: a second monster card for isolation from the tests above', () => {
    store.dispatch(actions.project.setActiveTab({ id: 'mtab' }));
    store.dispatch(actions.project.createCard({ newId: 'mcard2', type: 'monster' }));
    expect(store.getState().project.present.cards.mcard2.content.actions).toEqual([]);
  });

  it('add an entry -> undo removes it -> redo restores it', () => {
    store.dispatch(actions.project.addMonsterEntry({ id: 'mcard2', field: 'actions', entryId: 'e1' }));
    expect(store.getState().project.present.cards.mcard2.content.actions).toEqual([
      { id: 'e1', name: '', description: '' },
    ]);

    undo();
    expect(store.getState().project.present.cards.mcard2.content.actions).toEqual([]);

    redo();
    expect(store.getState().project.present.cards.mcard2.content.actions).toEqual([
      { id: 'e1', name: '', description: '' },
    ]);
  });

  it('add, then edit the name, then undo reverts only the name edit - the entry still exists', () => {
    store.dispatch(actions.project.addMonsterEntry({ id: 'mcard2', field: 'actions', entryId: 'e2' }));
    store.dispatch(actions.project.updateMonsterEntry({
      id: 'mcard2', field: 'actions', entryId: 'e2', changes: { name: 'Scimitar' },
    }));

    undo();

    const entries = store.getState().project.present.cards.mcard2.content.actions;
    expect(entries).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'e2', name: '' })]));
  });

  it('delete an entry -> undo brings it back with the same id and text', () => {
    store.dispatch(actions.project.deleteMonsterEntry({ id: 'mcard2', field: 'actions', entryId: 'e2' }));
    expect(store.getState().project.present.cards.mcard2.content.actions.find(e => e.id === 'e2')).toBeUndefined();

    undo();

    const restored = store.getState().project.present.cards.mcard2.content.actions.find(e => e.id === 'e2');
    expect(restored).toEqual({ id: 'e2', name: '', description: '' });
  });

  it('duplicate -> undo removes only the copy, the source is untouched', () => {
    store.dispatch(actions.project.duplicateMonsterEntry({
      id: 'mcard2', field: 'actions', entryId: 'e2', newEntryId: 'e2-copy',
    }));
    expect(store.getState().project.present.cards.mcard2.content.actions.map(e => e.id)).toContain('e2-copy');

    undo();

    const ids = store.getState().project.present.cards.mcard2.content.actions.map(e => e.id);
    expect(ids).not.toContain('e2-copy');
    expect(ids).toContain('e2'); // source survives
  });

  it('add an entry, then a session toggle, then undo: the entry add reverts, the session toggle survives', () => {
    const before = store.getState().project.present.cards.mcard2.content.actions.length;
    store.dispatch(actions.project.addMonsterEntry({ id: 'mcard2', field: 'actions', entryId: 'e3' })); // undoable
    store.dispatch(actions.session.setMonsterCollapsed({ id: 'mcard2', key: 'actions', collapsed: true })); // session, not undo-tracked

    undo();

    const state = store.getState();
    expect(state.project.present.cards.mcard2.content.actions).toHaveLength(before);
    expect(state.session.monsterCollapse.mcard2.actions).toBe(true); // the session toggle survived
  });
});
