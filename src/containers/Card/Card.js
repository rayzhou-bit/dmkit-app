import React from 'react';
import Draggable from 'react-draggable';

import './Card.css';
import logo from '../../logo.svg';

const card = props => {
  return (
    <Draggable>
      <div>
        <img src={logo} className="App-logo" alt="logo" />
      </div>
    </Draggable>
  );
};

export default card;