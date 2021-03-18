import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewScreen.scss';
import * as actions from '../../store/actionIndex';
import { GRID } from '../../shared/constants/grid';
import Card from './Card/Card';

// ViewScreen is the main portion the user is looking at. This is located in the center of the screen.

const ViewScreen = props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STATES
  const [cardAnimation, setCardAnimation] = useState({});

  // STORE SELECTORS
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardCollection = useSelector(state => state.campaignData.cards);

  // FUNCTIONS
  const onCardDrop = (event) => {
    event.preventDefault();
    const targetCardId = event.dataTransfer.getData("text");
    if (cardCollection[targetCardId]) {
      if (!cardCollection[targetCardId].views[activeViewId]) {
        // future update: more precise pos calculation
        let xCalculation = Math.round((event.clientX-GRID.size-GRID.size)/GRID.size)*GRID.size;
        if (xCalculation<0) {xCalculation = 0}
        let yCalculation = Math.round((event.clientY-GRID.size-GRID.size)/GRID.size)*GRID.size;
        if (yCalculation<0) {yCalculation = 0}
        const pos = {x: xCalculation, y: yCalculation};
        dispatch(actions.linkCardToView(targetCardId, pos));
      } else {
        setCardAnimation({
          ...cardAnimation,
          [targetCardId]: 'blink .25s step-end 3 alternate',
        });
      }
    }
  };

  // STYLES
  let viewScreenStyle = {
    backgroundColor: 'transparent',
    width: '10000px',
    height: '10000px',
  };

  // CARD LIST
  let cardList = [];
  if (cardCollection) {
    for (let cardId in cardCollection) {
      if (cardCollection[cardId].views && cardCollection[cardId].views[activeViewId]) {
        cardList = [
          ...cardList,
          <Card key={cardId} 
            cardId={cardId} toolMenuRef={toolMenuRef}
            cardAnimation={cardAnimation} setCardAnimation={setCardAnimation}
          />,
        ];
      }
    }
  }

  return (
    <main className="view-screen"
      style={viewScreenStyle}
      onDrop={e => onCardDrop(e)} onDragOver={e => e.preventDefault()}>
      {cardList}
    </main>
  );
};

export default ViewScreen;