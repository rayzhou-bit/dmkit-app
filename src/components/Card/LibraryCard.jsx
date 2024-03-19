import React from 'react';

import { useLibraryCardHooks } from './hooks';

import Title from './Title';
import LibraryContent from './LibraryContent';

import './LibraryCard.scss';

const LibraryCard = ({ cardId }) => {
  const {
    libraryCardRef,
    isActive,
    isSelected,
    isEditing,
    cardAnimation,
    setIsEditing,
    onDragStart,
    onDragEnd,
    onAnimationEnd,
    onClick,
  } = useLibraryCardHooks({
    cardId
  });

  return (
    <div
      className={'library-card' + (isActive ? ' active-card' : ' inactive-card')}
      draggable={!isEditing}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      ref={libraryCardRef}
      style={cardAnimation}
    >
      {/* <div className="library-border"> */}
        <Title
          cardId={cardId}
          setEditingCard={setIsEditing}
        />
        <LibraryContent
          cardId={cardId}
          setEditingCard={setIsEditing}
          isSelected={isSelected}
        />
      {/* </div> */}
    </div>
  );
};

export default LibraryCard;
