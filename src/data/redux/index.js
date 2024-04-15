import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import undoable, { ActionCreators, includeAction } from 'redux-undo';

import * as project from './project';
import * as session from './session';
import * as user from './user';

const modules = {
  project,
  session,
  user,
};

let undoableActions = Object.keys(project.actions);
const actionsToRemove = [
  'initialize',
  'unloadProject',
  'loadProject',
  'loadIntroProject',
  'loadBlankProject',
  'loadCards',
  'loadTabs',
  'loadTabOrder',
  'setActiveCard',
  'setActiveTab',
  'setActiveTabScale',
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
