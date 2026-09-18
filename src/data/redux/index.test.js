// database.js (imported transitively via project/index.js's api usage in
// hooks, not this file) pulls in Firebase - this file itself doesn't touch
// it, so no mock needed.
import store, { actions, undo } from './index';

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

describe('undo history vs. section-collapse toggles', () => {
  it('undo reverts a field edit but not a collapse toggle done in between', () => {
    store.dispatch(actions.project.setActiveTab({ id: 'mtab' }));
    store.dispatch(actions.project.createCard({ newId: 'mcard', type: 'monster' }));
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'mcard', fields: { creatureType: 'first' } })); // undoable
    store.dispatch(actions.project.setCardSectionCollapsed({ id: 'mcard', section: 'header', collapsed: true })); // filtered
    store.dispatch(actions.project.updateCardMonsterFields({ id: 'mcard', fields: { creatureType: 'second' } })); // undoable

    undo();

    const present = store.getState().project.present;
    expect(present.cards.mcard.content.creatureType).toBe('first'); // the undoable edit was reverted
    expect(present.cards.mcard.content.collapsed.header).toBe(true); // the filtered toggle was not
  });

  it('updateCardPortrait is also undoable', () => {
    store.dispatch(actions.project.updateCardPortrait({ id: 'mcard', portrait: 'data:x', portraitAlt: 'x.png' }));
    undo();
    expect(store.getState().project.present.cards.mcard.content.portrait).toBe('');
  });
});
