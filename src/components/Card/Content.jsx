import React from 'react';

import { useContentHooks } from './hooks';

import './Card.scss';

const Content = ({
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

  return (
    <div className='card-content'>
      <textarea
        className='text'
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

export default Content;
