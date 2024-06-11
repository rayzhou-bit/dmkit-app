import React from 'react';
import { Rnd } from 'react-rnd';

import { useCardHooks } from './hooks';

import Title from './Title';
import Content from './Content';

import './Card.scss';
import { GRID_SIZE, MIN_CARD_SIZE } from '../../constants/dimensions';

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
      bounds='parent'
      // position
      position={position}
      // drag
      disableDragging={isEditing}
      dragHandleClassName='input-div'
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      // size
      size={size}
      minWidth={MIN_CARD_SIZE.width} 
      minHeight={MIN_CARD_SIZE.height}
      scale={activeTabScale}
      // resize
      enableResizing={{
        bottomLeft: true,
        bottomRight: true,
        topLeft: true,
        topRight: true,
      }}
      resizeGrid={[ GRID_SIZE, GRID_SIZE ]}
      onResizeStop={onResizeStop}
    >
      <div
        className={`card ${isActive ? 'active-card' : 'inactive-card'}`}
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