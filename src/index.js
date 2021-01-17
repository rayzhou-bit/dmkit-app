import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import campaignCollReducer from './store/reducer/campaignCollection';
import cardCollReducer from './store/reducer/cardCollection';
import viewCollReducer from './store/reducer/viewCollection';
import dataManagerReducer from './store/reducer/dataManager';
import cardManagerReducer from './store/reducer/cardManager';
import viewManagerReducer from './store/reducer/viewManager';
import * as serviceWorker from './serviceWorker';

const composeEnhancers = 
  process.env.NODE_ENV === 'development' 
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  : null || compose;

const rootReducer = combineReducers({
  campaignColl: campaignCollReducer,
  cardColl: cardCollReducer,
  viewColl: viewCollReducer,
  dataManager: dataManagerReducer,
  cardManager: cardManagerReducer,
  viewManager: viewManagerReducer,
});

const store = createStore(rootReducer, composeEnhancers(
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
