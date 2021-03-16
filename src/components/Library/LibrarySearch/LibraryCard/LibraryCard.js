import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './LibraryCard.scss';
import * as actions from '../../../../store/actionIndex';
import { CARD_FONT_SIZE } from '../../../../shared/constants/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS, CARD_TITLEBAR_COLORS } from '../../../../shared/constants/colors';

import EditImg from '../../../../assets/icons/edit-24.png';
import DeleteImg from '../../../../assets/icons/delete-24.png';

const LibraryCard = props => {
  const {cardId} = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [openColorSelect, setOpenColorSelect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.campaignData.activeCardId);
  const cardColor = useSelector(state => state.campaignData.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.cards[cardId].title);
  const cardText = useSelector(state => state.campaignData.cards[cardId].content.text);

  // IDS & REFS
  const libraryCardRef = useRef(cardId+".library-card");
  const titleInputRef = useRef(cardId+".library-card-title");
  const colorSelectRef = useRef(cardId+".library-card-color-select");
  const colorBtnRef = useRef(cardId+".library-card-color-btn");
  const deleteBtnRef = useRef(cardId+".library-card-remove-btn");
  const textRef = useRef(cardId+".library-card-text");
  
  // FUNCTIONS: CARD
  const cardDragHandler = (event) => event.dataTransfer.setData("text", cardId);

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) {dispatch(actions.updActiveCardId(cardId))}
      setIsSelected(true);
    }
  };

  useOutsideClick([libraryCardRef], isSelected, () => {
    if (cardId === activeCardId) {dispatch(actions.updActiveCardId(null))}
    setIsSelected(false);
  });

  // FUNCTIONS: TITLEBAR
  const beginTitleEdit = () => {
    if (!editingTitle) {
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(titleInputRef.current.value.length, titleInputRef.current.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };
  useOutsideClick([titleInputRef], editingTitle, endTitleEdit);

  const updTitleEdit = () => {
    if (editingTitle) dispatch(actions.updCardTitle(cardId, titleInputRef.current.value));
  };

  const keyPressTitleHandler = (event) => {
    if (isSelected && editingTitle) {
      if (event.key === 'Enter') {
        endTitleEdit();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        endTitleEdit();
        beginTextEdit();
      }
    }
  };

  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, () => setOpenColorSelect(false));

  const deleteCard = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(actions.destroyCard(cardId));
    }
  };

  useOutsideClick([deleteBtnRef], confirmDelete, () => setConfirmDelete(false));

  // FUNCTIONS: TEXT BODY
  const beginTextEdit = () => {
    if (!editingText) {
      textRef.current.focus();
      textRef.current.setSelectionRange(textRef.current.value.length, textRef.current.value.length);
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
    margin: cardId === activeCardId ? '0px 0px 8px 0px' : '2px 2px 10px 2px',
    zIndex: cardId === activeCardId ? '100' : '0',
  };

  // STYLES: TITLEBAR
  const titleStyle = {
    fontSize: CARD_FONT_SIZE.title+'px',
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };

  const colorButtonStyle = {
    backgroundColor: cardColor ? cardColor : "white",
  };
  const deleteButtonStyle = {
    backgroundColor: confirmDelete ? "red" : null,
    opacity: confirmDelete ? 1 : null,
  };

  // STYLES: CONTENT
  const contentContainerStyle = { height: CARD_FONT_SIZE.text*5.5+'px' };
  const contentContainerRef = (node) => {
    if (!node) return;
    if (!textRef.current) return;
    const completeTextHeight = textRef.current ? textRef.current.scrollHeight : 1000;
    const abridgedTextHeight = CARD_FONT_SIZE.text*5.5;
    node.style.height = isSelected
      ? completeTextHeight + 'px'
      : Math.min(abridgedTextHeight, completeTextHeight) + 'px';
  };

  const textStyle = {
    fontSize: CARD_FONT_SIZE.text+'px',
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
    <div key={cardId} ref={libraryCardRef}
      className="library-card" style={cardStyle} 
      draggable={!editingCard} onDragStart={e => cardDragHandler(e)}
      onClick={cardClickHandler}>
      <div className="library-card-title-container">
        <input ref={titleInputRef}
          className="title-input" style={titleStyle} type="text" required
          value={cardTitle} readOnly={!editingTitle}
          onDoubleClick={(cardId === activeCardId) ? beginTitleEdit : null}
          onChange={updTitleEdit}
          onKeyDown={e => keyPressTitleHandler(e)} />
        <button className="edit-title title-btn button-24"
          onClick={() => beginTitleEdit()}>
          <img src={EditImg} alt="Edit" draggable="false" />
          <span className="tooltip">Edit title</span>
        </button>
        <button ref={colorBtnRef} className="change-color title-btn button-24"
          onClick={() => setOpenColorSelect(!openColorSelect)}>
          <div style={colorButtonStyle} />
          <span className="tooltip">Change color</span>
        </button>
        <button ref={deleteBtnRef} className="remove-card title-btn button-24" style={deleteButtonStyle}
          onClick={deleteCard}>
          <img src={DeleteImg} alt="Delete" draggable="false" />
          <span className="tooltip">Delete card</span>
        </button>
      </div>
      <div ref={colorSelectRef} className="color-select" style={{display: openColorSelect ? "grid" : "none"}}>
        {colorList}
      </div>
      <div ref={contentContainerRef}
        className="library-card-content-container" style={contentContainerStyle}>
        <textarea ref={textRef}
          className="library-card-text" style={textStyle} 
          type="text"
          value={cardText} readOnly={!editingText}
          onClick={(cardId === activeCardId) ? beginTextEdit : null}
          onDoubleClick={(cardId !== activeCardId) ? beginTextEdit : null}
          onChange={updTextEdit}
          onKeyDown={e => keyPressTextHandler(e)} />
      </div>
    </div>
  );
};

export default LibraryCard;