import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Draggable from 'react-draggable';

import logo from './logo.svg';
import './App.css';

import * as actions from './store/action';

const App = props => {
  const dispatch = useDispatch();
  
  const onDragStop = (e, data) => dispatch(actions.savePOS(e,data));
  const onInitLoad = () => dispatch(actions.loadPOS());

  useEffect(() => {
    onInitLoad();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Draggable
          onStop={onDragStop}>
          <div><img src={logo} className="App-logo" alt="logo" /></div>
        </Draggable>
        <p>
          Edit <code>src/App.js</code> and save to reload.
          </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >Learn React</a>
      </header>
    </div>
  );
}

export default App;
