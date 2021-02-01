import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './LibCard.scss';
import * as actions from '../../../store/actionIndex';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../shared/constants/colors';

import DeleteImg from '../../../assets/icons/delete-24.png';

const LibCard = props => {
  const {cardId, cardData, activeViewId} = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.dataManager.activeCardId);

  // VARIABLES
  const cardViews = cardData.views;
  const cardContent = cardData.content;
  const cardColor = (cardViews && cardViews[activeViewId]) ? cardViews[activeViewId].color : "gray";
  const cardTitle = cardContent ? cardContent.title : "";
  const cardText = cardContent ? cardContent.text : "";

  // IDS & REFS
  const cardLibId = cardId + ".lib-card";
  const cardRef = useRef(cardLibId);
  const cardTitleId = cardId+".lib-title";
  const cardTitleRef = useRef(cardTitleId);
  const cardRemoveBtnRef = useRef(cardId+".remove-button");
  const cardTextId = cardId+".lib-textarea";
  const cardTextRef = useRef(cardTextId);

  // FUNCTIONS: CARD
  const drag = (event) => {event.dataTransfer.setData("text", event.target.id)};

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) {dispatch(actions.updActiveCardId(cardId))}
      setIsSelected(true);
    }
  };

  const outsideClickCardHandler = () => {
    if (cardId === activeCardId) {dispatch(actions.updActiveCardId(null))}
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

  const removeCard = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(actions.destroyCard(cardId));
    }
  };

  useOutsideClick([cardRemoveBtnRef], confirmDelete, setConfirmDelete, false);

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
    border: cardId === activeCardId ? '3px solid black' : '1px solid black',
    margin: cardId === activeCardId ? '0px' : '2px',
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
    fontSize: fontSize+'px',
    height: isSelected ? textHeight + 'px' : (fontSize+3)*3+10 + 'px',
    // overflowY: isSelected ? 'hidden' : 'auto',
    overflowY: 'hidden',
    backgroundColor: editingText ? "white" : "lightgray",
  };

  return (
    <div id={cardLibId} ref={cardRef}
      className="lib-card" style={cardStyle} 
      draggable={!editingCard} onDragStart={(e)=>drag(e)}
      onClick={cardClickHandler}
    >
      <div className="lib-title-bar">
        <input id={cardTitleId} ref={cardTitleRef}
          className="lib-title" style={titleBarStyle} type="text" required
          value={cardTitle} readOnly={!editingTitle}
          onDoubleClick={(cardId === activeCardId) ? startTitleEdit : null}
          onChange={updTitleEdit}
          onKeyDown={e => keyPressTitleHandler(e)}
        />
        <div ref={cardRemoveBtnRef} className="button" style={deleteButtonStyle}
          onClick={removeCard}
        >
          <img src={DeleteImg} alt="Delete" draggable="false" />
          <span className="tooltip">Delete card</span>
        </div>
      </div>
      <div className="lib-body" style={{backgroundColor: editingText ? 'white' : 'lightgray'}}>
        <textarea id={cardTextId} ref={cardTextRef}
          className="lib-textfield" style={bodyStyle} 
          type="text"
          value={cardText} readOnly={!editingText}
          onClick={(cardId === activeCardId) ? startTextEdit : null}
          onDoubleClick={(cardId !== activeCardId) ? startTextEdit : null}
          onChange={updTextEdit}
          onKeyDown={(e) => keyPressTextHandler(e)}
        />
      </div>
    </div>
  );
};

export default LibCard;