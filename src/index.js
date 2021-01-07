import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import userReducer from './store/reducer/user';
import campaignCollReducer from './store/reducer/campaignCollection';
import cardCollReducer from './store/reducer/cardCollection';
import viewCollReducer from './store/reducer/viewCollection';
import campaignManageReducer from './store/reducer/campaignManage';
import cardManageReducer from './store/reducer/cardManage';
import viewManageReducer from './store/reducer/viewManage';
import * as serviceWorker from './serviceWorker';

const composeEnhancers = 
  process.env.NODE_ENV === 'development' 
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  : null || compose;

const rootReducer = combineReducers({
  user: userReducer,
  campaignColl: campaignCollReducer,
  cardColl: cardCollReducer,
  viewColl: viewCollReducer,
  campaignManage: campaignManageReducer,
  cardManage: cardManageReducer,
  viewManage: viewManageReducer,
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
