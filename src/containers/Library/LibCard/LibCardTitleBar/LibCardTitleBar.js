import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './LibCardTitleBar.scss';
import * as actions from '../../../../store/actionIndex';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../../shared/constants/colors';
import Auxi from '../../../../hoc/Auxi';

import DeleteButton from '../../../../media/icons/delete.svg';

const LibCardTitleBar = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const setEditingCard = props.setEditingCard;
  const [editingTitle, setEditingTitle] = [props.editingTitle, props.setEditingTitle];
  const setEditingTextarea = props.setEditingTextarea;

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardColor = (cardData.views && cardData.views[activeView]) ? cardData.views[activeView].color : "gray";
  const cardTitle = (cardData.data && cardData.data.title) ? cardData.data.title : "loading...";
  const cardTitleId = cardId+"libTitle";
  const cardTitleRef = useRef(cardTitleId);

  // FUNCTIONS
  const beginEdit = () => {
    if (!editingTitle) {
      const title = document.getElementById(cardTitleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
      setEditingCard(true);
    }
  };

  const endEdit = () => {
    if (editingTitle) {
      dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value));
      setEditingTitle(false);
      setEditingCard(false);
    }
  };

  const keyPressHandler = (event) => {
    if (cardId === activeCard) {
      if (event.key === 'Enter') {
        endEdit();
      }
      if (event.key === 'Tab' && editingTitle) {
        event.preventDefault();
        dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value));
        setEditingTitle(false);
        const textareaId = document.getElementById(cardId+"Textarea");
        textareaId.focus();
        textareaId.setSelectionRange(textareaId.value.length, textareaId.value.length);
        setEditingTextarea(true);
      }
    }
  };

  // delete should take TWO clicks
  const setCardDelete = () => dispatch(actions.setCardDelete(cardId));

  useOutsideClick(cardTitleRef, endEdit);

  // STYLES
  const titleBarStyle = {
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };

  return (
    <Auxi>
      <div className="titleBar">
        <input ref={cardTitleRef} id={cardTitleId}
          className="title" style={titleBarStyle} type="text" required
          defaultValue={cardTitle}
          readOnly={!editingTitle}
          onDoubleClick={(cardId === activeCard) ? beginEdit : null}
          onKeyDown={(e) => keyPressHandler(e)}
        />
        <div className="titleBarButtons">
          <input type="image" src={DeleteButton} alt="Delete" 
            onClick={setCardDelete} 
          />
        </div>
      </div>
    </Auxi>
  );
});

export default LibCardTitleBar;