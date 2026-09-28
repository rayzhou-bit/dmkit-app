import React from 'react';

import { useContentHooks, useCardRefTrigger } from './hooks';
import CardRefField from './CardRefField';
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
    // Only the mounted textarea (edit mode) has a scrollHeight to measure -
    // in display mode there's nothing to read, so fall back to 'auto' and
    // let the display node size itself naturally instead of computing NaN.
    height: contentRef.current ? contentRef.current.scrollHeight + 31 : 'auto',
  };

  const textareaClassName = `library-card-textarea ${(isSelected || isExpanded) ? "selected" : ""}`;

  return (
    <div
      className='library-card-content-container'
      style={(isSelected || isExpanded) ? expandedStyle : condensedStyle}
    >
      <CardRefField readOnly={readOnly} editRef={contentRef} beginEdit={beginContentEdit} value={contentValue} placeholder='Fill me in!' className={textareaClassName}>
        <textarea
          className={textareaClassName}
          onBlur={() => { endContentEdit(); refTrigger.onBlur(); }}
          onChange={refTrigger.onChange}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={refTrigger.onKeyDown}
          onKeyUp={refTrigger.onKeyUp}
          onWheel={(e) => e.stopPropagation()}
          placeholder='Fill me in!'
          ref={contentRef}
          value={contentValue}
        />
        {refTrigger.picker && <CardRefPicker {...refTrigger.picker} />}
      </CardRefField>
    </div>
  );
};

export default LibraryTextContent;
