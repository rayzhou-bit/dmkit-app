import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../../store/actionIndex';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './FullCard.scss';
import CardTitle from './CardTitle/CardTitle';
import CardContent from './CardContent/CardContent';

const FullCard = props => {
  const { 
    cardId, toolMenuRef,
    cardAnimation, setCardAnimation,
    editingCard, setEditingCard,
  } = props;
  const dispatch = useDispatch();
  
  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [blink, setBlink] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);

  // REFS
  const fullCardRef = useRef();

  // FUNCTIONS
  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) dispatch(actions.updActiveCardId(cardId));
      setIsSelected(true);
    }
  };

  const onAnimationEnd = () => {
    setCardAnimation({...cardAnimation, [cardId]: null});
    setBlink(false);
  };
  
  useOutsideClick([fullCardRef, toolMenuRef], isSelected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );

  return (
    <div ref={fullCardRef} 
      className={
        "full-card" +
        ((cardId === activeCardId) ? " active-full-card" : "") + 
        (blink ? " blink-full-card" : "")
      } 
      style={{
        backgroundColor: cardColor,
        animation: cardAnimation ? cardAnimation[cardId] : null
      }}
      onClick={cardClickHandler}
      onAnimationEnd={onAnimationEnd}
    >
      <CardTitle cardId={cardId} setEditingCard={setEditingCard} />
      <CardContent cardId={cardId} setEditingCard={setEditingCard} />
    </div>
  );
};

export default FullCard;