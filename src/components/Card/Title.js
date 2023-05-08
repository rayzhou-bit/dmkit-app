import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

import './index.scss';
import '../../styles/colors.scss';
import { LightColors } from '../../styles/colors';
import LibraryIcon from '../../assets/icons/library-icon.png';
import RedTrashIcon from '../../assets/icons/red-trash.png';

import * as actions from '../../store/actionIndex';

import TitleInput from '../UI/Inputs/TitleInput';
import ColorDropdown from '../../sharedComponents/Dropdowns/ColorDropdown';
import ActionDropdown from '../../sharedComponents/Dropdowns/ActionDropdown';

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

  const options = [
    // {
    //   title: 'Insert image',
    //   callback: () => {},
    // },
    {
      title: 'Duplicate card',
      callback: () => dispatch(actions.copyCard(cardId)),
    },
    {},
    {
      title: 'Rename',
      callback: () => {},
    },
    {},
    // {
    //   title: 'Bring to front',
    //   callback: () => {},
    // },
    // {
    //   title: 'Send to back',
    //   callback: () => {},
    // },
    {
      title: 'Move to unsorted',
      callback: () => {},
      icon: LibraryIcon,
    },
    {},
    {
      title: 'Delete',
      type: 'danger',
      callback: () => {},
      icon: RedTrashIcon,
    },
  ];

  return (
    <div
      className={'title ' + color}
    >
      <TitleInput
        className={'input-div' + (isLightColor ? ' dark' : ' light')}
        saveValue={(value) => dispatch(actions.updCardTitle(cardId, value))}
        setEditingParent={setEditingCard}
        type='card'
        value={title} 
      />
      <button
        className='title-btn'
        ref={colorDropdownBtnRef}
        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
      >
        <i className={'open-color-icon' + (isLightColor ? ' dark' : ' light')} />
      </button>
      <ColorDropdown
        btnRef={colorDropdownBtnRef}
        cardColor={color}
        closeDropdown={() => setIsColorDropdownOpen(false)}
        isOpen={isColorDropdownOpen}
        updateColor={(color) => dispatch(actions.updCardColor(cardId, color))}
      />
      <button
        className='title-btn'
        ref={optionDropdownBtnRef}
        onClick={() => setIsOptionDropdownOpen(!isOptionDropdownOpen)}
      >
        <i className={'open-dropdown-icon' + (isLightColor ? ' dark' : ' light')} />
      </button>
      <ActionDropdown
        btnRef={optionDropdownBtnRef}
        closeDropdown={() => setIsOptionDropdownOpen(false)}
        isOpen={isOptionDropdownOpen}
        items={options}
      />
    </div>
  );
};

export default Title;