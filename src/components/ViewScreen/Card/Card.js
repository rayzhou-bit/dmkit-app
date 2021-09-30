import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import './Card.scss';
import * as actions from '../../../store/actionIndex';
import { useOutsideClick } from '../../../shared/utilityFunctions';
import { GRID } from '../../../shared/_grid';
import { CARD_FONT_SIZE } from '../../../shared/_fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../../shared/colors';
import CardTitle from './CardTitle/CardTitle';
import CardContent from './CardContent/CardContent';
import Blurb from './Blurb/Blurb';

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

  useOutsideClick([cardRef, toolMenuRef], isSelected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );

  // STYLES
  const cardStyle = {
    border: (cardId === activeCardId) ? '3px solid black' : '1px solid black',
    margin: (cardId === activeCardId) ? '0px' : '2px',
    animation: cardAnimation ? cardAnimation[cardId] : null,
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

  return (
    <Rnd bounds="parent"
      // z-index
      style={{zIndex: dragging 
        ? 20000*(cardPos.y + cardPos.x + 10) 
        : (cardId === activeCardId) 
        ? 10000*(cardPos.y + cardPos.x + 10) 
        : (100*cardPos.y + cardPos.x + 10),
      }}
      // position
      position={cardPos}
      // drag
      disableDragging={editingCard}
      dragHandleClassName="title-container"
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={(cardForm === "card") ? cardSize : {width: GRID.size*9, height: GRID.size*3}}
      minWidth={(cardForm === "card") ? GRID.size*9 : null} 
      minHeight={(cardForm === "card") ? GRID.size*9 : null}
      scale={activeViewScale}
      // resize
      enableResizing={(cardForm === "card") ? true : false}
      resizeGrid={[GRID.size, GRID.size]}
      onResizeStop={resizeStopHandler}
    >
      {cardForm === "card"
        ? cardObject 
        : <Blurb cardId={cardId} toolMenuRef={toolMenuRef} cardAnimation={cardAnimation} setCardAnimation={setCardAnimation} />
      }
    </Rnd>
  );
};

export default Card;