import React from 'react';

import { useContentHooks } from './hooks';

import './Card.scss';

const LibraryContent = ({
  cardId,
  isExpanded,
  isSelected,
  setEditingCard,
}) => {
  const {
    readOnly,
    contentRef,
    contentValue,
    changeContentValue,
    beginContentEdit,
    endContentEdit,
  } = useContentHooks({
    cardId,
    setEditingCard,
  });

  const condensedStyle = {
    minHeight: '60px',
    maxHeight: '80px',
    height: '80px',
  };

  const expandedStyle = {
    minHeight: '80px',
    maxHeight: '50vh',
    height: contentRef ? contentRef.current?.scrollHeight + 31 : null,
  };

  return (
    <div
      className='library-card-content-container'
      style={(isSelected || isExpanded) ? expandedStyle : condensedStyle}
    >
      <textarea
        className={`library-card-textarea ${(isSelected || isExpanded) ? "selected" : ""}`}
        onBlur={endContentEdit}
        onChange={(e) => changeContentValue(e.target.value)}
        onClick={beginContentEdit}
        onDragOver={(e) => e.preventDefault()}
        onWheel={(e) => e.stopPropagation()}
        placeholder='Fill me in!'
        readOnly={readOnly}
        ref={contentRef}
        value={contentValue}
      />
    </div>
  );
};

export default LibraryContent;
