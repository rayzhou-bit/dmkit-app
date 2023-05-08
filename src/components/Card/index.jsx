import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import './index.scss';
import { GRID } from '../../shared/constants/grid';

import useOutsideClick from '../../utils/useOutsideClick';
import * as actions from '../../store/actionIndex';

import Title from './Title';
import Content from './Content';

export const Card = ({
  cardId,
  toolMenuRef, 
  cardAnimation,
  setCardAnimation,
}) => {
  const dispatch = useDispatch();

  // STATES
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [editingCard, setEditingCard] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewScale = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].scale : null);
  const cardPos = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].pos);
  const cardSize = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].size);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);

  // REFS
  const cardRef = useRef();

  const isActive = cardId === activeCardId;

  // FUNCTIONS: CARD
  const dragStopHandler = (event, data) => {
    setIsDragging(false);
    if (cardPos) {
      if (cardPos.x !== data.x || cardPos.y !== data.y) {
        dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
      }
    } else {
      dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
    }
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
      if (!isActive) dispatch(actions.updActiveCardId(cardId));
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
      if (isActive) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );

  // STYLES
  const toFrontStyle = {
    zIndex: isDragging ? 20000*(cardPos.y + cardPos.x + 10) 
      : (isActive) ? 10000*(cardPos.y + cardPos.x + 10) 
      : (100*cardPos.y + cardPos.x + 10),
  };

  const cardStyle = {
    animation: cardAnimation ? cardAnimation[cardId] : null,
  };

  return (
    <Rnd style={toFrontStyle}
      bounds="parent"
      // position
      position={cardPos}
      // drag
      disableDragging={editingCard}
      dragHandleClassName="input-div"
      // dragGrid={[GRID.size, GRID.size]}
      onDragStart={()=>setIsDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={cardSize}
      minWidth={GRID.size*10} 
      minHeight={GRID.size*12}
      scale={activeViewScale}
      // resize
      enableResizing={{
        bottomLeft: true,
        bottomRight: true,
        topLeft: true,
        topRight: true,
      }}
      resizeGrid={[GRID.size, GRID.size]}
      onResizeStop={resizeStopHandler}
    >
      <div
        className={"card" + (isActive ? " active" : " not-active")}
        onClick={cardClickHandler}
        onAnimationEnd={onAnimationEnd}
        ref={cardRef} 
        style={cardStyle}
      >
        <Title
          cardId={cardId}
          color={cardColor}
          setEditingCard={setEditingCard}
          title={cardTitle}
        />
        <Content cardId={cardId} setEditingCard={setEditingCard} />
      </div>
    </Rnd>
  );
};

export default Card;