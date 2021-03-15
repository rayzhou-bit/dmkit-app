import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './CardTitle.scss';
import * as actions from '../../../../../store/actionIndex';
import { useOutsideClick } from '../../../../../shared/utilityFunctions';
import { CARD_FONT_SIZE } from '../../../../../shared/constants/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS, CARD_TITLEBAR_COLORS } from '../../../../../shared/constants/colors';

import EditImg from '../../../../../assets/icons/edit-24.png';
import ShrinkImg from '../../../../../assets/icons/shrink-24.png';
import CloseImg from '../../../../../assets/icons/remove-24.png';

const CardTitle = props => {
  const {cardId, titleInputRef, toolMenuRef, 
    editingTitle, setEditingTitle, editingCard,
    keyPressTitleHandler, endTitleEdit,
  } = props;
  const dispatch = useDispatch();

  // STATES
  const [openColorSelect, setOpenColorSelect] = useState(false);

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.campaignData.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardColor = useSelector(state => state.campaignData.cards[cardId].color);
  const cardColorForView = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].color);
  const cardColorToDisplay = cardColorForView ? cardColorForView : cardColor ? cardColor : "gray";
  const cardTitle = useSelector(state => state.campaignData.cards[cardId].title);

  // IDS & REFS
  const colorSelectRef = useRef(cardId+".card-color-select");
  const colorBtnRef = useRef(cardId+".card-color-btn");

  // FUNCTIONS
  const beginTitleEdit = () => {
    if (!editingTitle) {
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(titleInputRef.current.value.length, titleInputRef.current.value.length);
      setEditingTitle(true);
    }
  };

  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCardTitle(cardId, titleInputRef.current.value))}
  };

  useOutsideClick([titleInputRef, toolMenuRef], editingTitle, endTitleEdit);

  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, () => setOpenColorSelect(false));

  const unlinkCardFromView = () => {
    if (!editingCard) {
      dispatch(actions.unlinkCardFromView(cardId));
      endTitleEdit();
    }
  };

  const changeTypeToBubble = () => dispatch(actions.updCardForm(cardId, "bubble"));
  
  // STYLES
  const titleStyle = {
    fontSize: CARD_FONT_SIZE.title+'px',
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColorToDisplay], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColorToDisplay] : cardColorToDisplay, 
    cursor: editingTitle ? "text" : "move",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };
  const colorButtonStyle = {
    backgroundColor: cardColorToDisplay ? cardColorToDisplay : "white",
  };

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in CARD_TITLEBAR_COLORS) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColorForView(cardId, color))} />
    ];
  }

  return (
    <>
      <div className="title-container">
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
          <span className="tooltip">Change color for view</span>
        </button>
        <button className="remove-card title-btn button-24"
          onClick={unlinkCardFromView}>
          <img src={CloseImg} alt="Close" draggable="false" />
          <span className="tooltip">Remove card from view</span>
        </button>
        <button className="shrink title-btn button-24" 
          onClick={changeTypeToBubble}>
          <img src={ShrinkImg} alt="Shrink" draggable="false" />
          <span className="tooltip">Shrink card</span>
        </button>
      </div>
      <div ref={colorSelectRef} className="color-select" style={{display: openColorSelect ? "grid" : "none"}}>
        {colorList}
      </div>
    </>
  );
};

export default CardTitle;