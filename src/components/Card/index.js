import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import * as actions from '../../store/actionIndex';
import { useOutsideClick } from '../../shared/utilityFunctions';
import { GRID } from '../../shared/_grid';

import './index.scss';
import Title from './Title';
import Content from './Content';

const Card = props => {
  const {cardId, toolMenuRef,
    cardAnimation, setCardAnimation,
  } = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [blink, setBlink] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewScale = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].scale : null);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardPos = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].pos);
  const cardSize = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].size);
  const cardForm = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].cardForm);

  // REFS
  const fullCardRef = useRef();
  
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
      dragHandleClassName="title"
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
        <Title cardId={cardId} setEditingCard={setEditingCard} />
        <Content cardId={cardId} setEditingCard={setEditingCard} />
      </div>
    </Rnd>
  );
};

export default Card;