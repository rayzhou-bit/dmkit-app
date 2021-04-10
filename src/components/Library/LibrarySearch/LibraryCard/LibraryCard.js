import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './LibraryCard.scss';
import * as actions from '../../../../store/actionIndex';
import { CARD_FONT_SIZE } from '../../../../shared/constants/fontSize';
import { CARD_TITLEBAR_COLORS } from '../../../../shared/constants/colors';
import TitleInput from '../../../UI/Inputs/TitleInput';
import ContentTextarea from '../../../UI/Inputs/ContentTextarea';

import DeleteImg from '../../../../assets/icons/delete-24.png';

const LibraryCard = props => {
  const {cardId} = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [openColorSelect, setOpenColorSelect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editingCard, setEditingCard] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const cardColor = useSelector(state => state.campaignData.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.cards[cardId].title);
  const cardText = useSelector(state => state.campaignData.cards[cardId].content.text);

  // REFS
  const libraryCardRef = useRef();
  const colorSelectRef = useRef();
  const colorBtnRef = useRef();
  const deleteBtnRef = useRef();
  const textRef = useRef();
  const contentContainerCallbackRef = (node) => {
    if (!node) return;
    if (!textRef.current) return;
    const completeTextHeight = textRef.current ? textRef.current.scrollHeight : 1000;
    const abridgedTextHeight = CARD_FONT_SIZE.text*5.5;
    node.style.height = isSelected
      ? completeTextHeight + 'px'
      : Math.min(abridgedTextHeight, completeTextHeight) + 'px';
  };
  
  // FUNCTIONS: CARD
  const cardDragHandler = (event) => event.dataTransfer.setData("text", cardId);

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) dispatch(actions.updActiveCardId(cardId));
      setIsSelected(true);
    }
  };

  useOutsideClick([libraryCardRef], isSelected, () => {
    if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
    setIsSelected(false);
  });

  // FUNCTIONS: TITLEBAR
  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, () => setOpenColorSelect(false));

  const deleteCard = () => {
    if (!confirmDelete) setConfirmDelete(true);
    else dispatch(actions.destroyCard(cardId));
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
    if (editingText) setEditingText(false);
  };

  useOutsideClick([textRef], editingText, endTextEdit);

  const updTextEdit = () => {
    if (editingText) dispatch(actions.updCardText(cardId, textRef.current.value));
  };

  const keyPressTextHandler = (event) => {
    if (isSelected && editingText) {
      if (event.key === 'Tab') {
        event.preventDefault();
        // endTextEdit();
        // TODO tab key should indent in textarea
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
  const colorBtnStyle = { backgroundColor: cardColor ? cardColor : "white" };
  const deleteBtnStyle = {
    backgroundColor: confirmDelete ? "red" : null,
    opacity: confirmDelete ? 1 : null,
  };

  // STYLES: CONTENT
  const textStyle = {
    fontSize: CARD_FONT_SIZE.text+'px',
    backgroundColor: editingText ? "white" : "lightgray",
  };

  const contentContainerStyle = {
    // minHeight: isSelected ? 4*CARD_FONT_SIZE.text + 'px' : 2*CARD_FONT_SIZE.text + 'px',
    // maxHeight: isSelected ? '50vh' : 4*CARD_FONT_SIZE.text + 'px',
  };

  const contentContainerAdjust = () => {

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
    <div ref={libraryCardRef} className="library-card" style={cardStyle} 
      draggable={!editingCard} onDragStart={e => cardDragHandler(e)}
      onClick={cardClickHandler}>
      {/* title */}
      <div className="library-card-title-container">
        <button ref={colorBtnRef} className="change-color title-btn btn-24"
          onClick={() => setOpenColorSelect(!openColorSelect)}>
          <div style={colorBtnStyle} />
          <span className="tooltip">Change color</span>
        </button>
        <button ref={deleteBtnRef} className="delete-card title-btn btn-24" style={deleteBtnStyle}
          onClick={deleteCard}>
          <img src={DeleteImg} alt="Delete" draggable="false" />
          <span className="tooltip">Delete card</span>
        </button>
        <TitleInput className="title-input" btnClassName="edit-title title-btn btn-24"
          type="card" color={cardColor} btnSize={24}
          value={cardTitle} saveValue={v => dispatch(actions.updCardTitle(cardId, v))}
          setEditingParent={setEditingCard} />
      </div>
      {/* color */}
      <div ref={colorSelectRef} className="color-select" style={{display: openColorSelect ? "grid" : "none"}}>
        {colorList}
      </div>
      {/* content */}
      <div className="library-card-content-container" style={contentContainerStyle}>
        <textarea ref={textRef}
          className="library-card-text" style={textStyle} 
          type="text"
          value={cardText} readOnly={!editingText}
          onClick={(cardId === activeCardId) ? beginTextEdit : null}
          onDoubleClick={(cardId !== activeCardId) ? beginTextEdit : null}
          onChange={updTextEdit}
          onKeyDown={e => keyPressTextHandler(e)} />
        {/* <ContentTextarea className="library-card-text"
          value={cardText} saveValue={v => dispatch(actions.updCardText(cardId, v))}
          setEditingParent={setEditingCard} /> */}
      </div>
    </div>
  );
};

export default LibraryCard;