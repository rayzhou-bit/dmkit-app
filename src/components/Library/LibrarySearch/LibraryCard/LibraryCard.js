import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './LibraryCard.scss';
import * as actions from '../../../../store/actionIndex';
import { CARD_FONT_SIZE } from '../../../../shared/_fontSize';
import { CARD_TITLEBAR_COLORS } from '../../../../shared/colors';
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
  const [editingCard, setEditingCard] = useState(false);
  const [cardAnimation, setCardAnimation] = useState({});

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const cardViews = useSelector(state => state.campaignData.present.cards[cardId].views);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);
  const cardText = useSelector(state => state.campaignData.present.cards[cardId].content.text);

  // REFS
  const libraryCardRef = useRef();
  const colorSelectRef = useRef();
  const colorBtnRef = useRef();
  const deleteBtnRef = useRef();
  
  // FUNCTIONS: CARD
  const cardDragStartHandler = (event) => event.dataTransfer.setData("text", cardId);
  const cardDragEndHandler = () => {
    if (cardViews[activeViewId]) {
      setCardAnimation({
        ...cardAnimation,
        [cardId]: 'library-card-blink .25s step-end 4 alternate',
      });
    };
  };

  const onAnimationEnd = () => {
    setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    })
  };

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

  useOutsideClick([deleteBtnRef], confirmDelete, () => setConfirmDelete(false));
  
  const deleteCard = () => {
    if (!confirmDelete) setConfirmDelete(true);
    else dispatch(actions.destroyCard(cardId));
  };

  // STYLES: CARD
  const cardStyle = {
    border: cardId === activeCardId ? '3px solid black' : '1px solid black',
    margin: cardId === activeCardId ? '0px 0px 8px 0px' : '2px 2px 10px 2px',
    zIndex: cardId === activeCardId ? '100' : '0',
    animation: cardAnimation ? cardAnimation[cardId] : null,
  };

  // STYLES: TITLEBAR
  const colorBtnStyle = { backgroundColor: cardColor ? cardColor : "white" };
  const deleteBtnStyle = {
    backgroundColor: confirmDelete ? "red" : null,
    opacity: confirmDelete ? 1 : null,
  };

  // STYLES: CONTENT
  const contentContainerStyle = {
    minHeight: isSelected ? 6*CARD_FONT_SIZE.text + 'px' : 3*CARD_FONT_SIZE.text + 'px',
    maxHeight: isSelected ? '50vh' : 4*CARD_FONT_SIZE.text + 'px',
    height: isSelected ? '35vh' : 4*CARD_FONT_SIZE.text + 'px',
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
      draggable={!editingCard} 
      onDragStart={cardDragStartHandler} onDragEnd={cardDragEndHandler}
      onClick={cardClickHandler}
      onAnimationEnd={onAnimationEnd}>
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
        <ContentTextarea className="library-card-textarea"
          value={cardText} saveValue={v => dispatch(actions.updCardText(cardId, v))}
          setEditingParent={setEditingCard} />
      </div>
    </div>
  );
};

export default LibraryCard;