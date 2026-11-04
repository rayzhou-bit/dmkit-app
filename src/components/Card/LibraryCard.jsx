import React from 'react';

import { useLibraryCardHooks, useCardType, usePortraitHooks } from './hooks';
import { CARD_TYPES } from '../../constants/cards';
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

  // Hoisted here so the title bar's add-image button can reach openFilePicker.
  // Only offered while expanded: the file input lives in the portrait, which
  // a condensed card doesn't render.
  const cardType = useCardType(cardId);
  const portraitHooks = usePortraitHooks({ cardId });
  const expanded = isExpanded || (isMobile && isActive);
  const hasPortraitSlot = cardType === CARD_TYPES.monster || cardType === CARD_TYPES.note;
  const canAddImage = hasPortraitSlot && (expanded || isSelected) && !portraitHooks.hasPortrait;

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
          onAddImage={canAddImage ? portraitHooks.openFilePicker : undefined}
        />
        <LibraryContent
          cardId={cardId}
          portraitHooks={portraitHooks}
          setEditingCard={setIsEditing}
          isExpanded={expanded}
          isSelected={isSelected}
        />
      {/* </div> */}
    </div>
  );
};

export default LibraryCard;
