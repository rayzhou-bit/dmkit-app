import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

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
  const userId = useSelector(state => state.userData.userId);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardCollection = useSelector(state => state.campaignData.cards);

  const viewScreenWidth = 500 *GRID.size;
  const viewScreenHeight = 250 *GRID.size;
  const [ boardWidth, boardHeight ] = [ 500*GRID.size, 250*GRID.size ];

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
    width: viewScreenWidth + 'px',
    height: viewScreenHeight + 'px',
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
    userId && !activeCampaignId
      ? <main className="empty-screen">
          <div>No active project loaded. Please select your project or create a new one.</div>
        </main>
      : <main className="view-screen"
          style={viewScreenStyle}
          onDrop={e => onCardDrop(e)} onDragOver={e => e.preventDefault()}>
          {cardList}
        </main>
  );
  return (
    <main className="view-screen">
      {userId && !activeCampaignId
        ? <div className="empty-screen">
            <div>No active project loaded. Please select your project or create a new one.</div>
          </div>
        : <div className="board-container">
            <Rnd
              bounds="parent"
              // position
              // drag
              dragHandleClassName="board"
              // size
              size={{width: boardWidth, height: boardHeight}}
              // resize
              enableResizing={false}
            >
              <div className="board">
                {cardList}
              </div>
            </Rnd>
          </div>
      }
    </main>
  );
};

export default ViewScreen;