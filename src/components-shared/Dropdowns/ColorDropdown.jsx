import React, { useRef } from 'react';

import './ColorDropdown.scss';
import '../../constants/colors.scss';
import { CARD_COLOR_KEYS } from '../../constants/colors';
import useOutsideClick from '../../utils/useOutsideClick';

export const ColorDropdown = ({
  btnRef,
  isOpen,
  message,
  onClose,
  onUpdateColor,
  selectedColor,
}) => {
  const dropdownRef = useRef();
  
  useOutsideClick([btnRef, dropdownRef], isOpen, onClose);

  if (!isOpen) return null;

  let colorList = [];
  Object.values(CARD_COLOR_KEYS).forEach(color => {
    let className = 'item ' + color;
    if (selectedColor === color) {
      className += ' selected-color';
    }
    colorList = [
      ...colorList,
      <button
        className={className}
        key={color}
        onClick={() => onUpdateColor(color)}
      />
    ];
  });

  return (
    <div
      className='color-dropdown'
      ref={dropdownRef}
    >
      <div className='select-text'>{message}</div>
      <div className='container'>
        { colorList }
      </div>
    </div>
  );
};

export default ColorDropdown;