import React, { useRef } from 'react';

import './ActionDropdown.scss';
import useOutsideClick from '../../utils/useOutsideClick';

export const ActionDropdown = ({
  btnRef,
  closeDropdown,
  isOpen,
  items,
}) => {
  const dropdownRef = useRef();
  
  useOutsideClick([btnRef, dropdownRef], isOpen, closeDropdown);

  if (!isOpen) return null;

  let itemsList = [];
  items.forEach(item => {
    if (Object.keys(item).length === 0) {
      itemsList = [
        ...itemsList,
        <li className='break' />
      ];
    }
    else {
      const { title, type, callback, icon } = item;
      itemsList = [
        ...itemsList,
        <li>
          <button className='item-btn' onClick={callback}>
            <p className={type + ' btn-title'} >{title}</p>
            {icon ? <img className='btn-icon' src={icon} /> : null}
          </button>
        </li>
      ];
    }
  });

  return (
    <div
      className='action-dropdown'
      ref={dropdownRef}
    >
      <ul>
        { itemsList }
      </ul>
    </div>
  );
};

export default ActionDropdown;