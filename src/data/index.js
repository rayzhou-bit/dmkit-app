import { combineReducers } from "redux";
import undoable, { includeAction } from 'redux-undo';

import * as account from './account';
// import * as api from './api';
import * as app from './app';

const modules = {
  account,
  app,
};

const moduleProps = (propName) => Object.keys(modules).reduce(
  (obj, moduleKey) => ({ ...obj, [moduleKey]: modules[moduleKey][propName] }),
  {},
);

const undoConfig = {
  filter: includeAction([ app.actions ]),
  limit: 10,
};

const actions = moduleProps('actions');
const selectors = moduleProps('selectors');
const rootReducer = combineReducers({
  account: account.reducer,
  app: undoable(
    app.reducer,
    undoConfig,
  ),
});

export { actions, selectors };
export default rootReducer;