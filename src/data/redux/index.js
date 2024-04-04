import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import undoable, { ActionCreators, includeAction } from 'redux-undo';

import * as project from './project';
import * as session from './session';
import * as user from './user';

/* TODO: redux refactor
    Files under /data will be the future store for dmkit.
    Get these files to work with the app.
    Files under /store to be removed.
*/

const modules = {
  project,
  session,
  user,
};

let undoableActions = Object.keys(project.actions);
const actionsToRemove = [
  'initialize',
  'loadProject',
  'loadIntroProject',
  'updateActiveCard',
  'updateActiveTab',
  'updateActiveTabScale',
];
undoableActions = undoableActions.filter(action => !actionsToRemove.includes(action));
undoableActions = undoableActions.map(action => 'project/' + action);

const rootReducer = combineReducers({
  project: undoable(
    project.reducer,
    {
      filter: includeAction(undoableActions),
      limit: 10,
    }
  ),
  session: session.reducer,
  user: user.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

const moduleProps = (propName) => Object.keys(modules).reduce(
  (obj, moduleKey) => ({ ...obj, [moduleKey]: modules[moduleKey][propName] }),
  {},
);
const actions = moduleProps('actions');
const selectors = moduleProps('selectors');

const undo = () => store.dispatch(ActionCreators.undo());
const redo = () => store.dispatch(ActionCreators.redo());
const clearHistory = () => store.dispatch(ActionCreators.clearHistory());

export { actions, selectors };
export { undo, redo, clearHistory };
export default store;
