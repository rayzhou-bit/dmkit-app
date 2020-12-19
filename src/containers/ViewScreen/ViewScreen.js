import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewScreen.scss';
import * as actions from '../../store/actionIndex';
import { GRID } from '../../shared/constants/grid';
import SaveAlert from '../../components/saveAlert/saveAlert'
import Card from '../Card/Card';

// ViewScreen is the main portion the user is looking at. This is located in the center of the screen.

const ViewScreen = props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STATES
  const [cardAnimation, setCardAnimation] = useState({});
  const [saving, setSaving] = useState(false); //this will look to serverside campaign state later

  // STORE SELECTORS
  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cardColl = useSelector(state => state.card);
  // const cardDelete = useSelector(state => state.cardManage.cardDelete);
  // const viewColl = useSelector(state => state.view);
  // const viewOrder = useSelector(state => state.viewManage.viewOrder);
  // const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);

  // VARIABLES
  const viewScreenRef = useRef("viewscreen");

  // FUNCTIONS
  useEffect(() => { 
    dispatch(actions.fetchCardColl(user, campaign));
    dispatch(actions.fetchViewColl(user, campaign, activeView));
  }, [user, campaign]);

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

  // Save edited data when closing window
  // const saveEditedData = useCallback(() => {
  //   dispatch(actions.saveCards(user, campaign, cardColl, cardDelete));
  //   dispatch(actions.saveViews(user, campaign, viewColl, viewDelete, viewOrder));
  // }, []);
  // useEffect(() => {
  //   window.addEventListener("beforeunload", saveEditedData);
  //   return () => {
  //     document.removeEventListener("beforeunload", saveEditedData);
  //   }
  // }, [saveEditedData]);

  // STYLES
  let viewScreenStyle = {
    backgroundColor: activeView ? "white" : "lightgray",
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
      {saving ? <SaveAlert /> : null}
    </div>
  );
};

export default ViewScreen;