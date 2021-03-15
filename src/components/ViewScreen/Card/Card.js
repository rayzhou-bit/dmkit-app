import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../store/actionIndex';
import CardForm from './CardForm/CardForm';
import BubbleForm from './BubbleForm/BubbleForm';

const Card = props => {
  const {cardId, toolMenuRef, 
    cardAnimation, setCardAnimation,
  } = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.campaignData.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardPos = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].pos);
  const cardForm = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].cardForm);

  // IDS & REFS
  const cardRef = useRef(cardId+".card");

  // FUNCTIONS: CARD
  const dragStopHandler = (event, data) => {
    setDragging(false);
    if (data.deltaX !== 0 || data.deltaY !== 0) {
      dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
    }
  };

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) {dispatch(actions.updActiveCardId(cardId))}
      setIsSelected(true);
    }
  };

  const onAnimationEnd = () => {
    setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    })
  };

  // STYLES
  const toFrontStyle = {
    zIndex: dragging ? 200000 : cardId === activeCardId ? 100000 : cardPos.y
  };

  const cardStyle = {
    border: cardId === activeCardId ? '3px solid black' : '1px solid black',
    margin: cardId === activeCardId ? '0px' : '2px',
    animation: cardAnimation ? cardAnimation[cardId] : null,
  };

  // DISPLAY ELEMENTS
  const cardObject = (
    <CardForm cardId={cardId} cardRef={cardRef} toolMenuRef={toolMenuRef}
      isSelected={isSelected} setIsSelected={setIsSelected} setDragging={setDragging}
      dragStopHandler={dragStopHandler} cardClickHandler={cardClickHandler}
      toFrontStyle={toFrontStyle} cardStyle={cardStyle}
      onAnimationEnd={onAnimationEnd} />
  );

  const bubbleObject = (
    <BubbleForm cardId={cardId} cardRef={cardRef} toolMenuRef={toolMenuRef}
      isSelected={isSelected} setIsSelected={setIsSelected} setDragging={setDragging}
      dragStopHandler={dragStopHandler} cardClickHandler={cardClickHandler}
      toFrontStyle={toFrontStyle} cardStyle={cardStyle}
      onAnimationEnd={onAnimationEnd} />
  );

  return (
    cardForm === "bubble"
      ? bubbleObject 
      : cardObject
  );
};

export default Card;