import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { useOutsideClick } from '../../shared/utilityFunctions';
import { CARD_TITLEBAR_COLORS } from '../../shared/constants/colors';
import TitleInput from '../UI/Inputs/TitleInput';

import OpenColorIcon from '../../assets/icons/open-color.png';
import OpenDropDownIcon from '../../assets/icons/open-drop-down.png';
import ShrinkImg from '../../assets/icons/shrink-24.png';
import CloseImg from '../../assets/icons/remove-24.png';

import './index.scss';

const Title = ({
  cardId,
  setEditingCard,
}) => {
  const dispatch = useDispatch();

  // STATES
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [openColorSelect, setOpenColorSelect] = useState(false);

  // STORE SELECTORS
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);

  // REFS
  const colorSelectRef = useRef();
  const colorBtnRef = useRef();
  const inputRef = useRef();

  // FUNCTIONS
  useEffect(() => {
    setInputValue(cardTitle);
  }, [setInputValue, cardTitle]);

  const beginEdit = (event) => {
    if (!editing) {
      setEditing(true);
      if (setEditingCard) setEditingCard(true);
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  };

  const endEdit = (event) => {
    if (editing) {
      document.getSelection().removeAllRanges();
      if (inputValue !== cardTitle) {
        dispatch(actions.updCardTitle(cardId, inputValue));
      }
      setEditing(false);
      if (setEditingCard) setEditingCard(false);
    }
  };

  const keyPressHandler = (event) => {
    if (editing) {
      if (event.key === 'Enter' || event.key === 'Tab') endEdit();
    };
  };

  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, () => setOpenColorSelect(false));
  
  // STYLES
  const colorBtnStyle = { backgroundColor: cardColor ? cardColor : "white" };

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in CARD_TITLEBAR_COLORS) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColor(cardId, color))} />
    ];
  }

  return (
    <div
      className="title"
      style={{backgroundColor: cardColor}}
    >
      {/* <TitleInput
        btnClassName="edit-title title-btn btn-24" 
        btnSize={24}
        className="title-input"
        color={cardColor} 
        saveValue={v => dispatch(actions.updCardTitle(cardId, v))}
        setEditingParent={setEditingCard}
        type="card" 
        value={cardTitle} 
      /> */}
      <div className="input-div">
        <input 
          className="title-input"
          maxLength="50"
          onBlur={endEdit}
          onChange={e => setInputValue(e.target.value)}
          onDoubleClick={beginEdit}
          onDragOver={e => e.preventDefault()}
          onKeyDown={keyPressHandler}
          readOnly={!editing}
          ref={inputRef} 
          required
          size=''
          title={inputValue}
          type="text"  
          value={inputValue ? inputValue : ""}  
        />
      </div>
      <button
        ref={colorBtnRef}
        className="change-color title-btn btn-24"
        // onClick={() => setOpenColorSelect(!openColorSelect)}
      >
        <img src={OpenColorIcon} alt="Open Color" draggable="false" />
        <span className="tooltip">
          Color
        </span>
      </button>
      <button
        className="remove-card title-btn btn-24"
        // onClick={() => dispatch(actions.unlinkCardFromView(cardId))}
      >
        <img src={OpenDropDownIcon} alt="Open Dropdown" draggable="false" />
        <span className="tooltip">
          Options
        </span>
      </button>
      {/* <div className="title-container">
      </div>
      <div ref={colorSelectRef} className="color-select" 
        style={{display: openColorSelect ? "grid" : "none"}}>
        {colorList}
      </div> */}
    </div>
  );
};

export default Title;