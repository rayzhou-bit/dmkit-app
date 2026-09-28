import React from 'react';

import { useLibraryCardHooks } from './hooks';

import LibraryTitle from './LibraryTitle';
import CardRefs from './CardRefs';
import LibraryContent from './LibraryContent';

import './Card.scss';

const LibraryCard = ({
  cardId,
  isExpanded,
}) => {
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
    cardId,
  });

  // Matches LibraryCustomContent's own isSelected || isExpanded check -
  // the condensed view is a fixed 80px and a strip would squeeze it.
  const expanded = isSelected || isExpanded;

  return (
    <div
      className={`card ${isActive ? 'active-card' : 'inactive-card'}`}
      draggable={!isEditing}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      ref={libraryCardRef}
      style={cardAnimation}
    >
      {/* <div className="library-border"> */}
        <LibraryTitle
          cardId={cardId}
          setEditingCard={setIsEditing}
        />
        {expanded && <CardRefs cardId={cardId} />}
        <LibraryContent
          cardId={cardId}
          setEditingCard={setIsEditing}
          isExpanded={isExpanded}
          isSelected={isSelected}
        />
      {/* </div> */}
    </div>
  );
};

export default LibraryCard;
