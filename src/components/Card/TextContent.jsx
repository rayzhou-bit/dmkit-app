import React from 'react';

import { useContentHooks, useCardRefTrigger } from './hooks';
import CardRefField from './CardRefField';
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
      <CardRefField readOnly={readOnly} editRef={contentRef} beginEdit={beginContentEdit} value={contentValue} placeholder='Fill me in!' className='text'>
        <textarea
          className='text'
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

export default TextContent;
