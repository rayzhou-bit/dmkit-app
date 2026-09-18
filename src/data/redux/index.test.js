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
