import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './LibCard.scss';
import * as actions from '../../../store/actionIndex';
import { GRID } from '../../../shared/constants/grid';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../shared/constants/colors';

import DeleteButton from '../../../media/icons/delete.png';

const LibCard = props => {
  const {cardId, cardState, activeView} = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const activeCard = useSelector(state => state.cardManage.activeCard);

  // VARIABLES
  const cardViews = cardState.views;
  const cardData = cardState.data;
  const cardColor = (cardViews && cardViews[activeView]) ? cardViews[activeView].color : "gray";
  const cardTitle = cardData ? cardData.title : "";
  const cardText = cardData ? cardData.text : "";

  // IDS & REFS
  const cardLibId = cardId + ".libCard";
  const cardRef = useRef(cardLibId);
  const cardTitleId = cardId+".libTitle";
  const cardTitleRef = useRef(cardTitleId);
  const cardDeleteBtnRef = useRef(cardId+".deleteButton");
  const cardTextId = cardId+".libTextarea";
  const cardTextRef = useRef(cardTextId);

  // FUNCTIONS: CARD
  const drag = (event) => {event.dataTransfer.setData("text", event.target.id)};

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCard) {dispatch(actions.updActiveCard(cardId))}
      setIsSelected(true);
    }
  };

  const outsideClickCardHandler = () => {
    if (cardId === activeCard) {dispatch(actions.updActiveCard(null))}
    setIsSelected(false);
  };
  useOutsideClick([cardRef], isSelected, outsideClickCardHandler);

  // FUNCTIONS: TITLEBAR
  const startTitleEdit = () => {
    if (!editingTitle) {
      const title = document.getElementById(cardTitleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };

  useOutsideClick([cardTitleRef], editingTitle, endTitleEdit);

  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value))}
  };

  const keyPressTitleHandler = (event) => {
    if (isSelected && editingTitle) {
      if (event.key === 'Enter') {
        endTitleEdit();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        endTitleEdit();
        startTextEdit();
      }
    }
  };

  const deleteCard = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(actions.setCardDelete(cardId));
    }
  };

  useOutsideClick([cardDeleteBtnRef], confirmDelete, setConfirmDelete, false);

  // FUNCTIONS: TEXT BODY
  const startTextEdit = () => {
    if (!editingText) {
      const text = document.getElementById(cardTextId);
      text.focus();
      text.setSelectionRange(text.value.length, text.value.length);
      setEditingText(true);
    }
  };

  const endTextEdit = () => {
    if (editingText) {setEditingText(false)}
  };

  useOutsideClick([cardTextRef], editingText, endTextEdit);

  const updTextEdit = () => {
    if (editingText) {dispatch(actions.updCardText(cardId, cardTextRef.current.value))}
  };

  const keyPressTextHandler = (event) => {
    if (isSelected && editingText) {
      if (event.key === 'Tab') {
        event.preventDefault();
        endTextEdit();
      }
    }
  };

  // STYLES: CARD
  const cardStyle = {
    border: cardId === activeCard ? '3px solid black' : '1px solid black',
    margin: cardId === activeCard ? '0px' : '2px',
  };

  // STYLES: TITLEBAR
  const titleBarStyle = {
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };

  const deleteButtonStyle = {
    backgroundColor: confirmDelete ? "red" : "lightgray",
  };

  // STYLES: BODY TEXT
  const fontSize = 18;
  const textBox = document.getElementById(cardTextId);
  let textHeight = textBox ? textBox.scrollHeight : null;
  const bodyStyle = {
    height: isSelected ? textHeight + 'px' : (fontSize+3)*3+10 + 'px',
    overflowY: isSelected ? 'hidden' : 'auto',
    fontSize: fontSize+'px',
    backgroundColor: editingText ? "white" : "lightgray",
    userSelect: "none",
  };

  return (
    <div id={cardLibId} ref={cardRef}
      className="libCard" style={cardStyle} 
      draggable={!editingCard} onDragStart={(e)=>drag(e)}
      onClick={cardClickHandler}
    >
      <div className="libTitleBar">
        <input ref={cardTitleRef} id={cardTitleId}
          className="libTitle" style={titleBarStyle} type="text" required
          value={cardTitle} readOnly={!editingTitle}
          onDoubleClick={(cardId === activeCard) ? startTitleEdit : null}
          onChange={updTitleEdit}
          onKeyDown={(e) => keyPressTitleHandler(e)}
        />
        <input ref={cardDeleteBtnRef}
          className="libTitleBarButtons" style={deleteButtonStyle}
          type="image" src={DeleteButton} alt="Delete" 
          onClick={deleteCard} 
        />
      </div>
      <div className="libBody">
        <textarea ref={cardTextRef} id={cardTextId}
          className="libTextfield" style={bodyStyle} 
          type="text"
          value={cardText} readOnly={!editingText}
          onClick={(cardId === activeCard) ? startTextEdit : null}
          onDoubleClick={(cardId !== activeCard) ? startTextEdit : null}
          onChange={updTextEdit}
          onKeyDown={(e) => keyPressTextHandler(e)}
        />
      </div>
    </div>
  );
};

export default LibCard;