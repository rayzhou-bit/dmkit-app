import * as redux from 'redux';
import thunk from 'redux-thunk';

import reducer from '../data';

export const createStore = () => {
  const composeEnhancers = process.env.NODE_ENV === 'development'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
    : (null || redux.compose);

  const store = redux.createStore(
    reducer,
    composeEnhancers(redux.applyMiddleware(thunk))
  );

  return store;
};

const store = createStore();

export default store;