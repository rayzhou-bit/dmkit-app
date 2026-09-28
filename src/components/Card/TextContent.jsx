import React from 'react';

import { useContentHooks, useCardRefTrigger } from './hooks';
import CardRefPicker from './CardRefPicker';

import './Card.scss';

const TextContent = ({
  cardId,
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

  return (
    <div className='card-content'>
      <textarea
        className='text'
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

export default TextContent;
