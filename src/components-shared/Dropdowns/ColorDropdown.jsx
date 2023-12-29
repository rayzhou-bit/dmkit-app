import React, { useRef } from 'react';

import './ColorDropdown.scss';
import '../../styles/colors.scss'
import { CardColorKeys } from '../../styles/colors';
import useOutsideClick from '../../utils/useOutsideClick';

export const ColorDropdown = ({
  btnRef,
  cardColor,
  isOpen,
  onClose,
  onUpdateColor,
}) => {
  const dropdownRef = useRef();
  
  useOutsideClick([btnRef, dropdownRef], isOpen, onClose);

  if (!isOpen) return null;

  let colorList = [];
  Object.values(CardColorKeys).forEach(color => {
    let className = 'item ' + color;
    if (cardColor === color) {
      className += ' selected';
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
      <div className='select-text'>Select card top color</div>
      <div className='container'>
        { colorList }
      </div>
      {/* TODO add recent colors */}
    </div>
  );
};

export default ColorDropdown;