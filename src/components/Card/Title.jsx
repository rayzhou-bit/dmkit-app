import React from 'react';
import { useDispatch } from 'react-redux';

import './index.scss';
import '../../styles/colors.scss';

import * as actions from '../../store/actionIndex';
import * as hooks from './hooks';

import ColorDropdown from '../../sharedComponents/Dropdowns/ColorDropdown';
import ActionDropdown from '../../sharedComponents/Dropdowns/ActionDropdown';

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
      <button className='title-btn' onClick={openColorDropdown} ref={colorDropdownBtnRef}>
        <i className={'open-color-icon' + (isLightColor ? ' dark' : ' light')} />
      </button>
      <ColorDropdown
        btnRef={colorDropdownBtnRef}
        cardColor={color}
        isOpen={isColorDropdownOpen}
        onClose={closeColorDropdown}
        onUpdateColor={(color) => dispatch(actions.updCardColor(cardId, color))}
      />
      <button
        className='title-btn'
        ref={optionDropdownBtnRef}
        onClick={openOptionsDropdown}
      >
        <i className={'open-dropdown-icon' + (isLightColor ? ' dark' : ' light')} />
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
