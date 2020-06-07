import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Draggable from 'react-draggable';

import * as actions from '../../store/actionIndex';
import './Card.scss';
import logo from '../../logo.svg';

const Card = React.memo(props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);

  const removeCard = useCallback(() => dispatch(actions.removeCard(user, campaign, props.id)), []);

  const onDragStop = (e, data) => dispatch(actions.saveCardPos(e, data, user, campaign, props.id));

  return (
    <Draggable
      defaultPosition={{ x: props.x, y: props.y }}
      grid={[25, 25]}
      bounds="parent"
      handle="header"
      onStop={onDragStop}
    >
      <div className="Card">
        <div className="Header">
          <header className="Title">Drag here</header>
          <button className="DelButton" onClick={removeCard}>X</button>
        </div>
        <div className="Body">
          <p>{props.id}</p>
          <p>x: {props.x} | y: {props.y}</p>
          <img src={logo} className="App-logo" alt="logo" />
        </div>
      </div>
    </Draggable>
  );
});

export default Card;