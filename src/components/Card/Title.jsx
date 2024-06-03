import React from 'react';

import { useTitleHooks, useColorDropdownHooks, useOptionsDropdownHooks } from './hooks';

import ColorDropdown from '../../components-shared/Dropdowns/ColorDropdown';
import ActionDropdown from '../../components-shared/Dropdowns/ActionDropdown';

import './Card.scss';
import '../../styles/colors.scss';
import OpenColorBlackIcon from '../../assets/icons/rounded-square.svg';
import OpenColorWhiteIcon from '../../assets/icons/rounded-square-white.svg';
import DropdownArrowBlackIcon from '../../assets/icons/dropdown-arrow.svg';
import DropdownArrowWhiteIcon from '../../assets/icons/dropdown-arrow-white.svg';

const Title = ({
  cardId,
  setEditingCard,
}) => {

  const {
    inputClassName,
    readOnly,
    titleRef,
    titleValue,
    changeTitleValue,
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
  } = useTitleHooks({
    cardId,
    setEditingCard,
  });

  const {
    color,
    colorDropdownBtnRef,
    isColorDropdownOpen,
    isLightColor,
    closeColorDropdown,
    openColorDropdown,
    updateColor,
  } = useColorDropdownHooks({ cardId });

  const {
    isOptionDropdownOpen,
    options,
    optionDropdownBtnRef,
    closeOptionsDropdown,
    openOptionsDropdown,
  } = useOptionsDropdownHooks({
    beginTitleEdit,
    cardId,
  });

  return (
    <div className={'card-title ' + color}>
      <div className={'input-div' + (isLightColor ? ' dark' : ' light')}>
        <input
          className={inputClassName}
          maxLength='50'
          onBlur={endTitleEdit}
          onChange={(e) => changeTitleValue(e.target.value)}
          onDoubleClick={beginTitleEdit}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={handleTitleKeyPress}
          readOnly={readOnly}
          ref={titleRef}
          title={titleValue}
          type='text'
          value={titleValue}
        />
      </div>
      <button
        className='color-btn'
        onClick={openColorDropdown}
        ref={colorDropdownBtnRef}
      >
        <img src={isLightColor ? OpenColorBlackIcon : OpenColorWhiteIcon} />
      </button>
      <ColorDropdown
        btnRef={colorDropdownBtnRef}
        isOpen={isColorDropdownOpen}
        message="Select card-top color"
        onClose={closeColorDropdown}
        onUpdateColor={updateColor}
        selectedColor={color}
      />
      <button
        className='dropdown-btn'
        ref={optionDropdownBtnRef}
        onClick={openOptionsDropdown}
      >
        <img src={isLightColor ? DropdownArrowBlackIcon : DropdownArrowWhiteIcon} />
      </button>
      <ActionDropdown
        btnRef={optionDropdownBtnRef}
        isOpen={isOptionDropdownOpen}
        onClose={closeOptionsDropdown}
        items={options}
      />
    </div>
  );
};

export default Title;
