import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './CardContent.scss';
import * as actions from '../../../../../store/actionIndex';
import { useOutsideClick } from '../../../../../shared/utilityFunctions';

const CardContent = props => {
  const {cardId, textInputRef, toolMenuRef, 
    isSelected, editingText, setEditingText,
    beginTextEdit,
  } = props;
  const dispatch = useDispatch();

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.campaignData.activeCardId);
  const cardText = useSelector(state => state.campaignData.cards[cardId].content.text);

  // FUNCTIONS
  const endTextEdit = () => {
    if (editingText) {setEditingText(false)}
  };

  const updTextEdit = () => {
    if (editingText) {dispatch(actions.updCardText(cardId, textInputRef.current.value))}
  };

  const keyPressTextHandler = (event) => {
    if (isSelected && editingText) {
      if (event.key === 'Tab') {
        event.preventDefault();
        endTextEdit();
      }
    }
  };

  useOutsideClick([textInputRef, toolMenuRef], editingText, endTextEdit);

  // STYLES
  const textBodyStyle = {
    backgroundColor: editingText ? "white" : "lightgray",
    userSelect: "none",
  };

  return (
    <div className="card-content">
      <textarea ref={textInputRef}
        className="text-textarea" style={textBodyStyle} 
        type="text"
        value={cardText} readOnly={!editingText}
        placeholder="Fill me in!"
        onClick={(cardId === activeCardId) ? beginTextEdit : null}
        onDoubleClick={(cardId !== activeCardId) ? beginTextEdit : null}
        onChange={updTextEdit}
        onKeyDown={(e) => keyPressTextHandler(e)}
      />
    </div>
  );
};

export default CardContent;