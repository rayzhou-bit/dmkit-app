import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewScreen.scss';
import * as actions from '../../store/actionIndex';
import { GRID } from '../../shared/constants/grid';
import Card from '../Card/Card';

// ViewScreen is the main portion the user is looking at. This is located in the center of the screen.

const ViewScreen = props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STATES
  const [cardAnimation, setCardAnimation] = useState({});

  // STORE SELECTORS
  // const userId = useSelector(state => state.user.user);
  // const campaignId = useSelector(state => state.campaignManage.activeCampaign);
  const cardColl = useSelector(state => state.cardColl);
  // const cardCreate = useSelector(state => state.cardManage.cardCreate);
  // const cardDelete = useSelector(state => state.cardManage.cardDelete);
  // const viewColl = useSelector(state => state.viewColl);
  // const viewOrder = useSelector(state => state.viewManage.viewOrder);
  // const editedViewOrder = useSelector(state => state.viewManage.editedViewOrder);
  // const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);
  
  // VARIABLES
  const viewScreenRef = useRef("viewscreen");

  // FUNCTIONS
  const drop = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const targetCardId = data.split(".")[0];
    if (cardColl[targetCardId]) {
      if (!cardColl[targetCardId].views[activeView]) {
        // future update: more precise pos calculation
        let xCalculation = Math.round((event.clientX-GRID.size-GRID.size)/GRID.size)*GRID.size;
        if (xCalculation<0) {xCalculation = 0}
        let yCalculation = Math.round((event.clientY-GRID.size-GRID.size)/GRID.size)*GRID.size;
        if (yCalculation<0) {yCalculation = 0}
        const pos = {x: xCalculation, y: yCalculation};
        const size = {width: GRID.size*10, height: GRID.size*10};
        const color = "gray";
        dispatch(actions.connectCardToView(targetCardId, activeView, pos, size, color));
      } else {
        setCardAnimation({
          ...cardAnimation,
          [targetCardId]: 'blink .25s step-end 3 alternate',
        });
      }
    }
  };

  const allowDrop = (event) => {event.preventDefault()};

  // STYLES
  let viewScreenStyle = {
    // backgroundColor: activeView ? "white" : "lightgray",
    backgroundColor: 'transparent',
  };

  // CARD LIST
  let cardList = [];
  if (cardColl) {
    for (let cardId in cardColl) {
      if (cardColl[cardId].views && cardColl[cardId].views[activeView]) {
        cardList = [
          ...cardList,
          <Card key={cardId} toolMenuRef={toolMenuRef}
            cardId={cardId} cardState={cardColl[cardId]} activeView={activeView}
            cardAnimation={cardAnimation}
            setCardAnimation={setCardAnimation}
          />,
        ];
      }
    }
  }

  return (
    <div id="viewScreen" ref={viewScreenRef} 
      style={viewScreenStyle}
      onDrop={(e)=>drop(e)} onDragOver={(e)=>allowDrop(e)}
    >
      {cardList}
    </div>
  );
};

export default ViewScreen;