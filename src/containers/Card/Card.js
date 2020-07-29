import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import * as actions from '../../store/actionIndex';
import './Card.scss';
import CardHeader from './CardHeader/CardHeader';
import CardBody from './CardBody/CardBody';

//bubble, short, long modes

const Card = (props) => {
  const dispatch = useDispatch();

  const [editingCard, setEditingCard] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardPos = cardData.views[activeView].pos;
  const cardSize = cardData.views[activeView].size;
  const cardColor = cardData.views[activeView].color;

  const onDragStop = (e, pos) => dispatch(actions.updCardPos(cardId, activeView, {x: pos.x, y: pos.y}));
  const onResizeStop = (e, direction, ref, delta, position) => {
    dispatch(actions.updCardSize(cardId, activeView, {width: ref.style.width, height: ref.style.height}));
    if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
      dispatch(actions.updCardPos(cardId, activeView, {x: position.x, y: position.y}));
    }
  };

  const onClickCard = (clickedCard) => dispatch(actions.onClickCard(clickedCard));

  //right + bottom resize work
  //left + top resize does not work
  // this is due to how positioning is determined by topleft corner

  return (
    <Rnd
      bounds="parent"
      onClick={(cardId === activeCard) ? null : (() => onClickCard(cardId))}
      // position and dragging properties
      position={cardPos}
      dragGrid={[25, 25]}
      dragHandleClassName="header"
      onDragStop={onDragStop}
      disableDragging={editingCard}
      // size and resizing properties
      size={cardSize}
      minWidth={150}
      minHeight={150}
      resizeGrid={[25, 25]}
      onResizeStop={onResizeStop}
    >
      <div className="card" style={{backgroundColor: cardColor}}>
        <CardHeader id={cardId} setEditingCard={setEditingCard} />
        <CardBody id={cardId} setEditingCard={setEditingCard} />
      </div>
    </Rnd>
  );
};

export default Card;
