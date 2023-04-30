import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import * as actions from '../../store/actionIndex';
import TitleInput from '../UI/Inputs/TitleInput';

import './index.scss';
import '../../styles/colors.scss';
import { CardColorKeys, LightColors } from '../../styles/colors';

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

  const isLightColor = LightColors.includes(color);
  console.log(color, isLightColor)

  return (
    <div
      className={"title " + color}
    >
      <TitleInput
        className={"input-div" + (isLightColor ? " dark" : " light")}
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
      </button>
      <button
        className="open-dropdown-btn"
        // onClick={() => dispatch(actions.unlinkCardFromView(cardId))}
      >
        <i className={"open-dropdown-icon" + (isLightColor ? " dark" : " light")} />
      </button>
    </div>
  );
};

export default Title;