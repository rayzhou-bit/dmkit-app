import React from 'react';

import { useContentHooks, useCardRefTrigger } from './hooks';
import CardRefPicker from './CardRefPicker';

import './Card.scss';

const LibraryTextContent = ({
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
  const refTrigger = useCardRefTrigger({ cardId, editRef: contentRef, value: contentValue, changeValue: changeContentValue });

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
        onBlur={() => { endContentEdit(); refTrigger.onBlur(); }}
        onChange={refTrigger.onChange}
        onClick={beginContentEdit}
        onDragOver={(e) => e.preventDefault()}
        onKeyDown={refTrigger.onKeyDown}
        onKeyUp={refTrigger.onKeyUp}
        onWheel={(e) => e.stopPropagation()}
        placeholder='Fill me in!'
        readOnly={readOnly}
        ref={contentRef}
        value={contentValue}
      />
      {refTrigger.picker && <CardRefPicker {...refTrigger.picker} />}
    </div>
  );
};

export default LibraryTextContent;
