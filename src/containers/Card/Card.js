import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './Card.scss';
import * as actions from '../../store/actionIndex';
import { GRID } from '../../shared/constants/grid';
import CardTitleBar from './CardTitleBar/CardTitleBar';
import CardBody from './CardBody/CardBody';

const Card = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const [isSelected, setIsSelected] = useState(false);
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
  const cardRef = useRef(cardId+".card");

  // FUNCTIONS
  const dragStopHandler = (event, data) => dispatch(actions.updCardPos(cardId, activeView, {x: data.x, y: data.y}));

  const resizeStopHandler = (event, direction, ref, delta, position) => {
    dispatch(actions.updCardSize(cardId, activeView, {width: ref.style.width, height: ref.style.height}));
    if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
      dispatch(actions.updCardPos(cardId, activeView, {x: position.x, y: position.y}));
    }
  };

  const clickHandler = () => {
    if (cardId !== activeCard) {dispatch(actions.updActiveCard(cardId))}
    if (!isSelected) {setIsSelected(true)}
  };

  const outsideClickHandler = () => {
    if (cardId === activeCard && isSelected) {
      dispatch(actions.updActiveCard(null));
      setIsSelected(false);
    }
  };
  useOutsideClick(cardRef, outsideClickHandler, cardId);

  // STYLES
  const toFrontStyle = {zIndex: cardId === activeCard ? 10 : 0};
  const cardStyle = {
    border: cardId === activeCard ? '3px solid black' : '1px solid black',
    margin: cardId === activeCard ? '0px' : '2px',
  };

  return (
    <Rnd style={toFrontStyle}
      bounds="parent"
      // position and dragging properties
      disableDragging={editingCard}
      position={cardPos}
      dragGrid={[GRID.size, GRID.size]}
      dragHandleClassName="titleBar"
      // size and resizing properties
      size={cardSize}
      minWidth={GRID.size*5}
      minHeight={GRID.size*5}
      resizeGrid={[GRID.size, GRID.size]}
      // functions
      onDragStop={dragStopHandler}
      onResizeStop={resizeStopHandler}
      onClick={clickHandler}
    >
      <div ref={cardRef} className="card" style={cardStyle}>
        <CardTitleBar id={cardId} 
          isSelected={isSelected}
          setEditingCard={setEditingCard}
          editingTitle={editingTitle} setEditingTitle={setEditingTitle}
          showViewSettings={showViewSettings} setShowViewSettings={setShowViewSettings}
          setEditingTextarea={setEditingTextarea}
        />
        <CardBody id={cardId} 
          isSelected={isSelected}
          setEditingCard={setEditingCard} 
          editingTextarea={editingTextarea} setEditingTextarea={setEditingTextarea}
        />
      </div>
    </Rnd>
  );
});

export default Card;
