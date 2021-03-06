import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './LibraryCard.scss';
import * as actions from '../../../../store/actionIndex';
import { CARD_FONT_SIZE } from '../../../../shared/constants/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS, CARD_TITLEBAR_COLORS } from '../../../../shared/constants/colors';

import DeleteImg from '../../../../assets/icons/delete-24.png';

const LibCard = props => {
  const {cardId, cardData, activeViewId} = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [openColorSelect, setOpenColorSelect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.dataManager.activeCardId);

  // VARIABLES
  const cardViews = cardData.views;
  const cardContent = cardData.content;
  const cardColor = cardData.color ? cardData.color : "white";
  const cardTitle = cardData.title;
  const cardText = cardContent ? cardContent.text : "";

  // IDS & REFS
  const libraryCardId = cardId + ".library-card";
  const cardRef = useRef(libraryCardId);
  const titleId = cardId+".library-card-title";
  const titleRef = useRef(titleId);
  const colorSelectRef = useRef(cardId+".library-color-select");
  const colorBtnRef = useRef(cardId+".library-color-btn");
  const deleteBtnRef = useRef(cardId+".library-remove-btn");
  const textId = cardId+".library-text";
  const textRef = useRef(textId);

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
      const title = document.getElementById(titleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };
  useOutsideClick([titleRef], editingTitle, endTitleEdit);

  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCardTitle(cardId, titleRef.current.value))}
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

  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, setOpenColorSelect, false);

  const deleteCard = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(actions.destroyCard(cardId));
    }
  };

  useOutsideClick([deleteBtnRef], confirmDelete, setConfirmDelete, false);

  // FUNCTIONS: TEXT BODY
  const startTextEdit = () => {
    if (!editingText) {
      const text = document.getElementById(textId);
      text.focus();
      text.setSelectionRange(text.value.length, text.value.length);
      setEditingText(true);
    }
  };

  const endTextEdit = () => {
    if (editingText) {setEditingText(false)}
  };

  useOutsideClick([textRef], editingText, endTextEdit);

  const updTextEdit = () => {
    if (editingText) {dispatch(actions.updCardText(cardId, textRef.current.value))}
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
    zIndex: cardId === activeCardId ? '100' : '0',
  };

  // STYLES: TITLEBAR
  const titleBarStyle = {
    fontSize: CARD_FONT_SIZE.title+'rem',
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };

  const colorButtonStyle = {
    backgroundColor: cardData.color ? cardData.color : "white",
  };

  const deleteButtonStyle = {
    backgroundColor: confirmDelete ? "red" : null,
    opacity: confirmDelete ? 1 : null,
  };

  // STYLES: CONTENT
  const completeTextHeight = document.getElementById(textId) ? document.getElementById(textId).scrollHeight : 0;
  const abridgedTextHeight = CARD_FONT_SIZE.text*3.2+'rem';
  const contentContainerStyle = {
    height: isSelected ? completeTextHeight : abridgedTextHeight,
  };
  const textStyle = {
    fontSize: CARD_FONT_SIZE.text+'rem',
    backgroundColor: editingText ? "white" : "lightgray",
  };

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in CARD_TITLEBAR_COLORS) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColor(cardId, color))} />
    ];
  }

  return (
    <div id={libraryCardId} ref={cardRef}
      className="library-card" style={cardStyle} 
      draggable={!editingCard} onDragStart={e => drag(e)}
      onClick={cardClickHandler}
    >
      <div className="library-card-title-container">
        <input id={titleId} ref={titleRef}
          className="title-input" style={titleBarStyle} type="text" required
          value={cardTitle} readOnly={!editingTitle}
          onDoubleClick={(cardId === activeCardId) ? startTitleEdit : null}
          onChange={updTitleEdit}
          onKeyDown={e => keyPressTitleHandler(e)}
        />
        <button ref={colorBtnRef} className="change-color title-btn button-24"
          onClick={() => setOpenColorSelect(!openColorSelect)}>
          <div style={colorButtonStyle} />
          {/* <span className="tooltip">Change color</span> */}
        </button>
        <button ref={deleteBtnRef} className="remove-card title-btn button-24" style={deleteButtonStyle}
          onClick={deleteCard}>
          <img src={DeleteImg} alt="Delete" draggable="false" />
          {/* <span className="tooltip">Delete card</span> */}
        </button>
      </div>
      <div ref={colorSelectRef} className="color-select" style={{display: openColorSelect ? "grid" : "none"}}>
        {colorList}
      </div>
      <div className="library-card-content-container" style={contentContainerStyle}>
        <textarea id={textId} ref={textRef}
          className="library-card-text" style={textStyle} 
          type="text"
          value={cardText} readOnly={!editingText}
          onClick={(cardId === activeCardId) ? startTextEdit : null}
          onDoubleClick={(cardId !== activeCardId) ? startTextEdit : null}
          onChange={updTextEdit}
          onKeyDown={e => keyPressTextHandler(e)}
        />
      </div>
    </div>
  );
};

export default LibCard;