import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import undoable, { includeAction } from 'redux-undo';

import App from './App';
import sessionManagerReducer from './store/reducer/sessionManager';
import userReducer from './store/reducer/userData';
import campaignDataReducer from './store/reducer/campaignData';
import * as serviceWorker from './serviceWorker';
import * as actionTypes from './store/actionTypes';

const composeEnhancers = 
  process.env.NODE_ENV === 'development' 
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  : null || compose;

// const editReducer = () =>
//   baseReducer => (state, action) => {
//     return dispatch => {
//       dispatch( { type: actionTypes.SET_CAMPAIGN_EDIT, edit: true } );
//       dispatch(baseReducer(state, action));
//     } 
//   };
// console.log(Object.values(actionTypes))

const rootReducer = combineReducers({
  sessionManager: sessionManagerReducer,
  userData: userReducer,
  campaignData: undoable(campaignDataReducer, {
    filter: includeAction([
      actionTypes.UPD_CAMPAIGN_TITLE, actionTypes.SHIFT_VIEW_IN_VIEW_ORDER,
      actionTypes.CREATE_CARD, actionTypes.COPY_CARD, actionTypes.DESTROY_CARD, actionTypes.LINK_CARD_TO_VIEW, actionTypes.UNLINK_CARD_FROM_VIEW,
      actionTypes.UPD_CARD_POS, actionTypes.UPD_CARD_SIZE, 
      actionTypes.UPD_CARD_COLOR, actionTypes.UPD_CARD_COLOR_FOR_VIEW,
      actionTypes.UPD_CARD_FORM, 
      actionTypes.UPD_CARD_TITLE, actionTypes.UPD_CARD_TEXT,
      actionTypes.CREATE_VIEW, actionTypes.DESTROY_VIEW,
      actionTypes.UPD_VIEW_COLOR,
      actionTypes.UPD_VIEW_TITLE,
    ]),
    limit: 10,
    // debug: true,
  }),
});

export const store = createStore(rootReducer, composeEnhancers(
  applyMiddleware(thunk)
));

const app = (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
