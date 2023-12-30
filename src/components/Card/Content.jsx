import React from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';
import * as hooks from './hooks';

import './index.scss';

const Content = ({
  cardId,
  setEditingCard,
  text,
}) => {
  const dispatch = useDispatch();

  const {
    readOnly,
    contentRef,
    contentValue,
    changeContentValue,
    beginContentEdit,
    endContentEdit,
  } = hooks.useContentHooks({
    saveNewValue: (value) => dispatch(actions.updCardText(cardId, value)),
    setEditingCard,
    value: text,
  });

  return (
    <div className="content">
      <textarea
        className='text'
        onBlur={endContentEdit}
        onChange={(e) => changeContentValue(e.target.value)}
        onClick={beginContentEdit}
        onDragOver={(e) => e.preventDefault()}
        onWheel={(e) => e.stopPropagation()}
        placeholder="Fill me in!"
        readOnly={readOnly}
        ref={contentRef}
        value={contentValue}
      />
    </div>
  );
};

export default Content;