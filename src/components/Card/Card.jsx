import React from 'react';
import { Rnd } from 'react-rnd';

import { useCardHooks, useCardType, usePortraitHooks } from './hooks';
import { CARD_TYPES } from '../../constants/cards';

import Title from './Title';
import Content from './Content';

import './Card.scss';
import { GRID_SIZE } from '../../constants/dimensions';

export const Card = ({
  cardId,
  toolMenuRef,
  cardAnimation,
  setCardAnimation,
  groupDrag,
}) => {
  const {
    cardRef,
    isActive,
    isSelected,
    activeTabScale,
    size,
    minSize,
    position,
    rndStyle,
    animationStyle,
    isEditing,
    setIsEditing,
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStop,
    onClick,
    onAnimationEnd,
  } = useCardHooks({
    cardId,
    toolMenuRef,
    cardAnimation,
    setCardAnimation,
    groupDrag,
  });

  // Hoisted this far (not into Content) because the title bar's add-image
  // button, a sibling of Content, must reach openFilePicker.
  const cardType = useCardType(cardId);
  const portraitHooks = usePortraitHooks({ cardId });
  const hasPortraitSlot = cardType === CARD_TYPES.monster || cardType === CARD_TYPES.note;

  return (
    <Rnd style={rndStyle}
      bounds='parent'
      // position
      position={position}
      // drag
      disableDragging={isEditing}
      dragHandleClassName='input-div'
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={onDragStop}
      // size
      size={size}
      minWidth={minSize.width}
      minHeight={minSize.height}
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
        className={`card ${isActive || isSelected ? 'active-card' : 'inactive-card'}`}
        onClick={onClick}
        onAnimationEnd={onAnimationEnd}
        ref={cardRef}
        style={animationStyle}
      >
        <Title
          cardId={cardId}
          setEditingCard={setIsEditing}
          onAddImage={hasPortraitSlot && !portraitHooks.hasPortrait ? portraitHooks.openFilePicker : undefined}
        />
        <Content
          cardId={cardId}
          portraitHooks={portraitHooks}
          setEditingCard={setIsEditing}
        />
      </div>
    </Rnd>
  );
};

export default Card;
