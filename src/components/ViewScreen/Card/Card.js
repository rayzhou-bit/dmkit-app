import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import './Card.scss';
import * as actions from '../../../store/actionIndex';
import { useOutsideClick } from '../../../shared/utilityFunctions';
import { GRID } from '../../../shared/grid';
import { CARD_FONT_SIZE } from '../../../shared/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../../shared/colors';
import CardTitle from './CardTitle/CardTitle';
import CardContent from './CardContent/CardContent';

const Card = props => {
  const {cardId, toolMenuRef, 
    cardAnimation, setCardAnimation,
  } = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [editingCard, setEditingCard] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewScale = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].scale : null);
  const cardPos = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].pos);
  const cardSize = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].size);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardForm = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].cardForm);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);

  // REFS
  const cardRef = useRef();

  // FUNCTIONS: CARD
  const dragStopHandler = (event, data) => {
    setDragging(false);
    if (cardPos) {
      if (cardPos.x !== data.x || cardPos.y !== data.y) dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
    } else dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
  };
  
  const resizeStopHandler = (event, direction, ref, delta, position) => {
    if (delta.width !== 0 || delta.height !== 0) {
      dispatch(actions.updCardSize(cardId, {width: ref.style.width, height: ref.style.height}));
      if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
          dispatch(actions.updCardPos(cardId, {x: position.x, y: position.y}));
      }
    }
  };

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) dispatch(actions.updActiveCardId(cardId));
      setIsSelected(true);
    }
  };

  const onAnimationEnd = () => {
    setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    })
  };
  
  const changeTypeToCard = () => dispatch(actions.updCardForm(cardId, "card"));

  useOutsideClick([cardRef, toolMenuRef], isSelected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );

  // STYLES
  const toFrontStyle = {
    zIndex: dragging ? 20000*(cardPos.y + cardPos.x + 10) 
      : (cardId === activeCardId) ? 10000*(cardPos.y + cardPos.x + 10) 
      : (100*cardPos.y + cardPos.x + 10),
  };

  const cardStyle = {
    border: (cardId === activeCardId) ? '3px solid black' : '1px solid black',
    margin: (cardId === activeCardId) ? '0px' : '2px',
    animation: cardAnimation ? cardAnimation[cardId] : null,
  };
  
  const bubbleLetterStyle = {
    fontSize: CARD_FONT_SIZE.title+'px',
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor],
    backgroundColor: cardColor, 
  };

  // DISPLAY ELEMENTS
  const cardObject = (
    <div ref={cardRef} className="card" style={cardStyle}
      onClick={cardClickHandler}
      onAnimationEnd={onAnimationEnd}>
      <CardTitle cardId={cardId} setEditingCard={setEditingCard} />
      <CardContent cardId={cardId} setEditingCard={setEditingCard} />
    </div>
  );

  const bubbleObject = (
    <div ref={cardRef} className="bubble" style={cardStyle}
      onClick={cardClickHandler}
      onDoubleClick={changeTypeToCard}
      onAnimationEnd={onAnimationEnd}>
      <div className="short" style={bubbleLetterStyle} title={cardTitle ? cardTitle : null}>
        {/* {cardTitle ? cardTitle.split(' ')[0] : ""}  */}
        {cardTitle ? cardTitle : ""}
      </div>
    </div>
  );

  return (
    <Rnd style={toFrontStyle}
      bounds="parent"
      // position
      position={cardPos}
      // drag
      disableDragging={editingCard}
      dragHandleClassName={(cardForm === "bubble") ? "short" : "title-container"}
      // dragGrid={[GRID.size, GRID.size]}
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={(cardForm === "bubble") ? {width: GRID.size*3, height: GRID.size*1} : cardSize}
      minWidth={(cardForm === "bubble") ? null : GRID.size*5} 
      minHeight={(cardForm === "bubble") ? null : GRID.size*5}
      scale={activeViewScale}
      // resize
      enableResizing={(cardForm === "bubble") ? false : true}
      resizeGrid={[GRID.size, GRID.size]}
      onResizeStop={resizeStopHandler}
    >
      {cardForm === "bubble"
        ? bubbleObject 
        : cardObject}
    </Rnd>
  );
};

export default Card;