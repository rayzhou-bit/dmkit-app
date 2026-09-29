import React from 'react';

import { useLibraryCardHooks } from './hooks';
import useIsMobile from '../../utils/useIsMobile';

import LibraryTitle from './LibraryTitle';
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
  // Mobile has no canvas, so HTML5 drag-and-drop (dragging a card onto it)
  // only fights touch scrolling, and the active card is expanded: creating a
  // card makes it active but not selected, which would otherwise drop a new
  // card into the list collapsed with no way to open it.
  const isMobile = useIsMobile();

  return (
    <div
      className={`card ${isActive ? 'active-card' : 'inactive-card'}`}
      draggable={!isEditing && !isMobile}
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
        <LibraryContent
          cardId={cardId}
          setEditingCard={setIsEditing}
          isExpanded={isExpanded || (isMobile && isActive)}
          isSelected={isSelected}
        />
      {/* </div> */}
    </div>
  );
};

export default LibraryCard;
