import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import undoable, { includeAction } from 'redux-undo';

import App from './App';
import * as serviceWorker from './serviceWorker';
import store from './data/redux';

/* TODO: redux refactor
    Files under /data will be the future store for dmkit.
    Get these files to work with the app.
*/

// const composeEnhancers = 
//   process.env.NODE_ENV === 'development' 
//   ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
//   : null || compose;

// // const editReducer = () =>
// //   baseReducer => (state, action) => {
// //     return dispatch => {
// //       dispatch( { type: actionTypes.SET_CAMPAIGN_EDIT, edit: true } );
// //       dispatch(baseReducer(state, action));
// //     } 
// //   };

// const rootReducer = combineReducers({
//   sessionManager: sessionManagerReducer,
//   userData: userReducer,
//   campaignData: undoable(campaignDataReducer, {
//     filter: includeAction([
//       actionTypes.UPD_CAMPAIGN_TITLE,
//       actionTypes.SHIFT_VIEW_IN_VIEW_ORDER,
//       actionTypes.CREATE_CARD,
//       actionTypes.COPY_CARD,
//       actionTypes.DESTROY_CARD,
//       actionTypes.LINK_CARD_TO_VIEW,
//       actionTypes.UNLINK_CARD_FROM_VIEW,
//       actionTypes.UPD_CARD_POS,
//       actionTypes.UPD_CARD_SIZE, 
//       actionTypes.UPD_CARD_COLOR,
//       actionTypes.UPD_CARD_COLOR_FOR_VIEW,
//       actionTypes.UPD_CARD_FORM, 
//       actionTypes.UPD_CARD_TITLE,
//       actionTypes.UPD_CARD_TEXT,
//       actionTypes.CREATE_VIEW,
//       actionTypes.DESTROY_VIEW,
//       actionTypes.UPD_VIEW_COLOR,
//       actionTypes.UPD_VIEW_TITLE,
//     ]),
//     limit: 10,
//     // debug: true,
//   }),
// });

// export const store = configureStore({
//   reducer: rootReducer,
//   // middleware: composeEnhancers(applyMiddleware(thunk)),
//   devTools: process.env.NODE_ENV !== 'production',
// });

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
