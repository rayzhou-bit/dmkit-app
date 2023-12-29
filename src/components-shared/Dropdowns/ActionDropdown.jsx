import React, { useRef } from 'react';

import './ActionDropdown.scss';
import useOutsideClick from '../../utils/useOutsideClick';

/*
  Each item in the items array should be similar to the following object:
  {
    title: 'Move to unsorted',
    type: 'danger',
    callback: () => dispatch(actions.unlinkCardFromView(cardId)),
    icon: LibraryIcon,
  },
*/

export const ActionDropdown = ({
  btnRef,
  isOpen,
  items,
  onClose,
}) => {
  const dropdownRef = useRef();
  
  useOutsideClick([btnRef, dropdownRef], isOpen, onClose);

  if (!isOpen) return null;

  let itemsList = [];
  items.forEach((item, index) => {
    if (Object.keys(item).length === 0) {
      itemsList = [
        ...itemsList,
        <li className='break' key={'break' + index} />
      ];
    }
    else {
      const { title, type, callback, icon } = item;
      itemsList = [
        ...itemsList,
        <li key={title + index}>
          <button
            className='item-btn'
            onClick={() => {
              callback();
              onClose();
            }}
          >
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