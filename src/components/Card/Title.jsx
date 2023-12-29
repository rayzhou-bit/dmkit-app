import React from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';
import * as hooks from './hooks';

import ColorDropdown from '../../sharedComponents/Dropdowns/ColorDropdown';
import ActionDropdown from '../../sharedComponents/Dropdowns/ActionDropdown';

import './index.scss';
import '../../styles/colors.scss';
import OpenColorBlackIcon from '../../assets/icons/rounded-square.svg';
import OpenColorWhiteIcon from '../../assets/icons/rounded-square-white.svg';
import DropdownArrowBlackIcon from '../../assets/icons/dropdown-arrow.svg';
import DropdownArrowWhiteIcon from '../../assets/icons/dropdown-arrow-white.svg';

const Title = ({
  cardId,
  color,
  setEditingCard,
  title,
}) => {
  const dispatch = useDispatch();

  const {
    inputClassName,
    readOnly,
    titleRef,
    titleValue,
    changeTitleValue,
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
  } = hooks.useTitleHooks({
    color,
    saveNewValue: (value) => dispatch(actions.updCardTitle(cardId, value)),
    setIsEditingParent: setEditingCard,
    value: title,
  });

  const {
    colorDropdownBtnRef,
    isColorDropdownOpen,
    isLightColor,
    closeColorDropdown,
    openColorDropdown,
  } = hooks.useColorDropdownHooks({ color });

  const {
    isOptionDropdownOpen,
    options,
    optionDropdownBtnRef,
    closeOptionsDropdown,
    openOptionsDropdown,
  } = hooks.useOptionsDropdownHooks({
    beginTitleEdit,
    cardId,
  });

  return (
    <div className={'title ' + color}>
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
          required
          size=''
          title={titleValue}
          type='text'
          value={titleValue ?? ''}
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
        cardColor={color}
        isOpen={isColorDropdownOpen}
        onClose={closeColorDropdown}
        onUpdateColor={(color) => dispatch(actions.updCardColor(cardId, color))}
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
