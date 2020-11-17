import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { useOutsideClick } from '../../shared/utilityFunctions';

import * as actions from '../../store/actionIndex';
import './Card.scss';
import CardTitleBar from './CardTitleBar/CardTitleBar';
import CardBody from './CardBody/CardBody';

const Card = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const [editingCard, setEditingCard] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [editingTextarea, setEditingTextarea] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardPos = cardData.views[activeView].pos;
  const cardSize = cardData.views[activeView].size;
  const cardColor = cardData.views[activeView].color;
  const cardRef = useRef(cardId+"Card");

  // FUNCTIONS
  const dragStopHandler = (event, data) => dispatch(actions.updCardPos(cardId, activeView, {x: data.x, y: data.y}));

  const resizeStopHandler = (event, direction, ref, delta, position) => {
    dispatch(actions.updCardSize(cardId, activeView, {width: ref.style.width, height: ref.style.height}));
    if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
      dispatch(actions.updCardPos(cardId, activeView, {x: position.x, y: position.y}));
    }
  };

  const clickHandler = () => {
    if (cardId !== activeCard) {
      dispatch(actions.updActiveCard(cardId));
    }
  };

  const outsideClickHandler = () => {
    dispatch(actions.updActiveCard(null));
  };
  useOutsideClick(cardRef, cardId === activeCard, outsideClickHandler);

  // STYLES
  const cardStyle = {
    backgroundColor: cardColor,
    border: cardId === activeCard ? '3px solid black' : '1px solid black',
    margin: cardId === activeCard ? '0px' : '2px',
    zIndex: cardId === activeCard ? 10 : 1,
  };

  return (
    <Rnd style={cardStyle}
      // position and dragging properties
      bounds="parent"
      position={cardPos}
      dragGrid={[25, 25]}
      dragHandleClassName="titleBar"
      disableDragging={editingCard}
      // size and resizing properties
      size={cardSize}
      minWidth={150}
      minHeight={150}
      resizeGrid={[25, 25]}
      // functions
      onDragStop={dragStopHandler}
      onResizeStop={resizeStopHandler}
      onClick={clickHandler}
    >
      <div ref={cardRef} className="card" >
        <CardTitleBar id={cardId} 
          setEditingCard={setEditingCard}
          editingTitle={editingTitle} setEditingTitle={setEditingTitle}
          showViewSettings={showViewSettings} setShowViewSettings={setShowViewSettings}
          setEditingTextarea={setEditingTextarea}
        />
        <CardBody id={cardId} 
          setEditingCard={setEditingCard} 
          editingTextarea={editingTextarea} setEditingTextarea={setEditingTextarea}
        />
      </div>
    </Rnd>
  );
});

export default Card;
