import React from 'react';
import { Rnd } from 'react-rnd';

import { useCardHooks } from './hooks';

import Title from './Title';
import Content from './Content';

import './Card.scss';
import { GRID } from '../../shared/constants';

export const Card = ({
  cardId,
  toolMenuRef, 
  cardAnimation,
  setCardAnimation,
}) => {
  const {
    cardRef,
    isActive,
    activeTabScale,
    size,
    position,
    rndStyle,
    animationStyle,
    isEditing,
    setIsEditing,
    onDragStart,
    onDragStop,
    onResizeStop,
    onClick,
    onAnimationEnd,
  } = useCardHooks({
    cardId,
    toolMenuRef,
    cardAnimation,
    setCardAnimation,
  });

  return (
    <Rnd style={rndStyle}
      bounds="parent"
      // position
      position={position}
      // drag
      disableDragging={isEditing}
      dragHandleClassName="input-div"
      // dragGrid={[GRID.size, GRID.size]}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      // size
      size={size}
      minWidth={GRID.size * 12} 
      minHeight={GRID.size * 10}
      scale={activeTabScale}
      // resize
      enableResizing={{
        bottomLeft: true,
        bottomRight: true,
        topLeft: true,
        topRight: true,
      }}
      resizeGrid={[GRID.size, GRID.size]}
      onResizeStop={onResizeStop}
    >
      <div
        className={"card" + (isActive ? " active-card" : " inactive-card")}
        onClick={onClick}
        onAnimationEnd={onAnimationEnd}
        ref={cardRef} 
        style={animationStyle}
      >
        <Title
          cardId={cardId}
          setEditingCard={setIsEditing}
        />
        <Content
          cardId={cardId}
          setEditingCard={setIsEditing}
        />
      </div>
    </Rnd>
  );
};

export default Card;