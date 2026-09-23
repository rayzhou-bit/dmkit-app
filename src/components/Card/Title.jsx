import React from 'react';
import { useSelector } from 'react-redux';

import { useTitleHooks, useColorDropdownHooks, useOptionsDropdownHooks, useAddBlockDropdownHooks } from './hooks';
import { getCardType, CARD_TYPE_ICONS, CARD_TYPES } from '../../constants/cards';

import ColorDropdown from '../../components-shared/Dropdowns/ColorDropdown';
import ActionDropdown from '../../components-shared/Dropdowns/ActionDropdown';

import './Card.scss';
import '../../constants/colors.scss';
import OpenColorBlackIcon from '../../assets/icons/rounded-square.svg';
import OpenColorWhiteIcon from '../../assets/icons/rounded-square-white.svg';
import AddBlockBlackIcon from '../../assets/icons/add-block.svg';
import AddBlockWhiteIcon from '../../assets/icons/add-block-white.svg';
import DropdownArrowBlackIcon from '../../assets/icons/dropdown-arrow.svg';
import DropdownArrowWhiteIcon from '../../assets/icons/dropdown-arrow-white.svg';

const Title = ({
  cardId,
  setEditingCard,
}) => {
  const typeIcon = useSelector(state => CARD_TYPE_ICONS[getCardType(state.project.present.cards[cardId])]);
  const isCustomCard = useSelector(state => getCardType(state.project.present.cards[cardId]) === CARD_TYPES.custom);

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

  const {
    isAddBlockDropdownOpen,
    addBlockDropdownBtnRef,
    openAddBlockDropdown,
    closeAddBlockDropdown,
    addBlockOptions,
  } = useAddBlockDropdownHooks({ cardId });

  return (
    <div className={'card-title ' + color + (typeIcon ? ' has-type-icon' : '') + (isCustomCard ? ' has-add-block' : '')}>
      {typeIcon && (
        <span className='type-icon' title={typeIcon.label}>
          <img src={isLightColor ? typeIcon.darkIcon : typeIcon.lightIcon} alt='' draggable='false' />
        </span>
      )}
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
      {isCustomCard && (
        <>
          <button
            className='add-block-btn'
            onClick={openAddBlockDropdown}
            ref={addBlockDropdownBtnRef}
            title="Add a block"
          >
            <img src={isLightColor ? AddBlockBlackIcon : AddBlockWhiteIcon} alt='' draggable='false' />
          </button>
          <ActionDropdown
            btnRef={addBlockDropdownBtnRef}
            isOpen={isAddBlockDropdownOpen}
            onClose={closeAddBlockDropdown}
            items={addBlockOptions}
          />
        </>
      )}
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
