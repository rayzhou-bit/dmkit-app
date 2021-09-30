import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './Blurb.scss';
import * as actions from '../../../../store/actionIndex';
import { useOutsideClick } from '../../../../shared/utilityFunctions';
import { CARD_FONT_SIZE } from '../../../../shared/_fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../../../shared/colors';

const Blurb = props => {
  const { 
    cardId, toolMenuRef,
    cardAnimation, setCardAnimation,
  } = props;
  const dispatch = useDispatch();
  
  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [blink, setBlink] = useState(false);
  
  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);

  // REFS
  const blurbRef = useRef();

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
  
  const changeTypeToCard = () => dispatch(actions.updCardForm(cardId, "card"));

  useOutsideClick([blurbRef, toolMenuRef], isSelected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );

  return (
    <div ref={blurbRef} 
      className={
        "blurb" + 
        ((cardId === activeCardId) ? " active-blurb" : "") + 
        (blink ? " blink-blurb" : "")
      } 
      style={{
        backgroundColor: cardColor,
        animation: cardAnimation ? cardAnimation[cardId] : null
      }}
      onClick={cardClickHandler}
      onDoubleClick={changeTypeToCard}
      onAnimationEnd={onAnimationEnd}>
      <div className="title-container" 
        style={{
          fontSize: CARD_FONT_SIZE.title+'px',
          color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor],
          backgroundColor: cardColor, 
        }} 
        title={cardTitle ? cardTitle : null}
      >
        <p>{cardTitle ? cardTitle : ""}</p>
      </div>
    </div>
  );
};

export default Blurb;