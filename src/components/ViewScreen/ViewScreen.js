import React, { useState, useRef } from 'react';
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
  const activeViewLock = useSelector(state => activeViewId ? state.campaignData.views[activeViewId].lock : null);
  const activeViewPos = useSelector(state => activeViewId ? state.campaignData.views[activeViewId].pos : null);
  const activeViewScale = useSelector(state => activeViewId ? state.campaignData.views[activeViewId].scale : 1);
  const cardCollection = useSelector(state => state.campaignData.cards);

  const [ viewWidth, viewHeight ] = [ 100*GRID.size, 50*GRID.size ];

  // REFS
  const viewScreenRef = useRef();
  const viewRef = useRef();

  // FUNCTIONS
  const dragStopHandler = (event, data) => {
    dispatch(actions.updActiveViewPos({x: data.x, y: data.y}));
  };
  
  const wheelHandler = (event) => {
    if (activeViewLock === false) {
      let newScale = activeViewScale ? activeViewScale : 1;
      newScale += event.deltaY * -0.001;
      newScale = Math.min(Math.max(GRID.scaleMin, newScale), GRID.scaleMax);
      dispatch(actions.updActiveViewScale(newScale));
    }
  };

  const cardDropHandler = (event) => {
    event.preventDefault();
    const targetCardId = event.dataTransfer.getData("text");
    if (cardCollection[targetCardId]) {
      if (!cardCollection[targetCardId].views[activeViewId]) {
        // future update: more precise pos calculation
        let xCalculation = Math.round((event.clientX-GRID.size-GRID.size)/GRID.size)*GRID.size;
        if (xCalculation < 0) xCalculation = 0;
        let yCalculation = Math.round((event.clientY-GRID.size-GRID.size)/GRID.size)*GRID.size;
        if (yCalculation < 0) yCalculation = 0;
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
  const scaleViewStyle = {
    transform: 'scale('+activeViewScale+')',
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
    <main ref={viewScreenRef} className="view-screen" 
      onWheel={wheelHandler}>
      {userId && !activeCampaignId
        ? <div className="empty-screen">
            No active project loaded. Please select your project or create a new one.
          </div>
        : activeViewId
          ? <div className="scale-view"
              style={scaleViewStyle}>
              <Rnd
                // position
                position={activeViewPos ? activeViewPos : {x: 0, y: 0}}
                // drag
                disableDragging={(activeViewLock === undefined) ? true : activeViewLock}
                dragHandleClassName="drag-view"
                onDragStop={dragStopHandler}
                // size
                size={{width: viewWidth, height: viewHeight}}
                scale={activeViewScale}
                // resize
                enableResizing={false}
              >
                <div ref={viewRef} className="view"
                  onDrop={cardDropHandler} 
                  onDragOver={e => e.preventDefault()}>
                  <div className="drag-view" />
                  {cardList}
                </div>
              </Rnd>
            </div>
          : null
      }
    </main>
  );
};

export default ViewScreen;