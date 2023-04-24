import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { useOutsideClick } from '../../shared/utilityFunctions';
import { CARD_TITLEBAR_COLORS } from '../../shared/constants/colors';
import TitleInput from '../UI/Inputs/TitleInput';

import './index.scss';

const Title = ({
  cardId,
  color,
  setEditingCard,
  title,
}) => {
  const dispatch = useDispatch();

  // STATES
  const [openColorSelect, setOpenColorSelect] = useState(false);

  // REFS
  const colorSelectRef = useRef();
  const openColorBtnRef = useRef();
  const dropDownRef = useRef();
  const openDropdownBtnRef = useRef();

  // FUNCTIONS
  useOutsideClick([colorSelectRef, openColorBtnRef], openColorSelect, () => setOpenColorSelect(false));

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in CARD_TITLEBAR_COLORS) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColor(cardId, color))} />
    ];
  }

  // TODO SET UP COLOR FILE
  const isLightColor = false;

  return (
    <div
      className="title"
      style={{backgroundColor: color}}
    >
      <TitleInput
        className={"input-div" + (isLightColor ? " dark" : " light")}
        color={color} 
        saveValue={(value) => dispatch(actions.updCardTitle(cardId, value))}
        setEditingParent={setEditingCard}
        type="card" 
        value={title} 
      />
      <button
        ref={openColorBtnRef}
        className="open-color-btn"
        // onClick={() => setOpenColorSelect(!openColorSelect)}
      >
        <i className={"open-color-icon" + (isLightColor ? " dark" : " light")} />
        {/* <span className="tooltip">Color</span> */}
      </button>
      <button
        className="open-dropdown-btn"
        // onClick={() => dispatch(actions.unlinkCardFromView(cardId))}
      >
        <i className={"open-dropdown-icon" + (isLightColor ? " dark" : " light")} />
        {/* <span className="tooltip">Options</span> */}
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