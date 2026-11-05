import React from 'react';
import { useSelector } from 'react-redux';

import { useTitleHooks, useColorDropdownHooks, useOptionsDropdownLibraryHooks } from './hooks';
import { getCardType, CARD_TYPE_ICONS } from '../../constants/cards';
import useIsMobile from '../../utils/useIsMobile';

import ActionDropdown from '../../components-shared/Dropdowns/ActionDropdown';

import './Card.scss';
import '../../constants/colors.scss';
import DropdownArrowBlackIcon from '../../assets/icons/dropdown-arrow.svg';
import DropdownArrowWhiteIcon from '../../assets/icons/dropdown-arrow-white.svg';

const LibraryTitle = ({
  cardId,
  setEditingCard,
  onAddImage, // only passed for a portrait-capable card with no portrait yet
}) => {
  const typeIcon = useSelector(state => CARD_TYPE_ICONS[getCardType(state.project.present.cards[cardId])]);
  // Double-click guards the title against the card's own drag, which mobile
  // doesn't have - and double-tap is a zoom gesture there, so the title would
  // otherwise be uneditable. One tap opens it instead.
  const isMobile = useIsMobile();

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
    isLightColor,
    updateColor,
  } = useColorDropdownHooks({ cardId });

  const {
    isOptionDropdownOpen,
    options,
    optionDropdownBtnRef,
    closeOptionsDropdown,
    openOptionsDropdown,
  } = useOptionsDropdownLibraryHooks({
    beginTitleEdit,
    cardId,
    color,
    updateColor,
    onAddImage,
  });

  return (
    <div className={'card-title ' + color + (typeIcon ? ' has-type-icon' : '')}>
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
          onClick={isMobile ? beginTitleEdit : undefined}
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

export default LibraryTitle;
