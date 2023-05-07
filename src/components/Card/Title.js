import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';
import TitleInput from '../UI/Inputs/TitleInput';

import './index.scss';
import '../../styles/colors.scss';
import { LightColors } from '../../styles/colors';
import ColorDropdown from '../../sharedComponents/Dropdowns/ColorDropdown';

const Title = ({
  cardId,
  color,
  setEditingCard,
  title,
}) => {
  const dispatch = useDispatch();

  // STATES
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isOptionDropdownOpen, setIsOptionDropdownOpen] = useState(false);

  // REFS
  const colorDropdownBtnRef = useRef();
  const optionDropdownBtnRef = useRef();

  const isLightColor = LightColors.includes(color);

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
        className="title-btn"
        ref={colorDropdownBtnRef}
        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
      >
        <i className={"open-color-icon" + (isLightColor ? " dark" : " light")} />
      </button>
      <ColorDropdown
        btnRef={colorDropdownBtnRef}
        cardColor={color}
        closeDropdown={() => setIsColorDropdownOpen(false)}
        isOpen={isColorDropdownOpen}
        updateColor={(color) => dispatch(actions.updCardColor(cardId, color))}
      />
      <button
        className="title-btn"
        // onClick={() => dispatch(actions.unlinkCardFromView(cardId))}
      >
        <i className={"open-dropdown-icon" + (isLightColor ? " dark" : " light")} />
      </button>
    </div>
  );
};

export default Title;