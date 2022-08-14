import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';

import './index.scss';
import ContentTextarea from '../UI/Inputs/ContentTextarea';

const CardContent = ({
  cardId,
  setEditingCard,
}) => {
  const dispatch = useDispatch();

  // STORE SELECTORS
  const cardText = useSelector(state => (state.campaignData.present.cards[cardId].content ? state.campaignData.present.cards[cardId].content.text : ""));

  // FUNCTIONS

  // STYLES

  return (
    <div className="card-content">
      <ContentTextarea className="text-textarea"
        value={cardText} saveValue={v => dispatch(actions.updCardText(cardId, v))}
        setEditingParent={setEditingCard} />
      {/* <textarea className="text-textarea" style={textareaStyle}
        type="text"
        value={textareaValue ? textareaValue : ""} readOnly={!editing}
        placeholder="Fill me in!"
        onBlur={endEdit}
        onClick={beginEdit}
        onWheel={e => e.stopPropagation()}
        onChange={e => setTextareaValue(e.target.value)}
        onKeyDown={keyPressHandler}
        onDragOver={e => e.preventDefault()}
      /> */}
    </div>
  );
};

export default CardContent;