import React, { useRef } from 'react';

import './ActionDropdown.scss';
import { CARD_COLOR_KEYS } from '../../constants/colors';
import '../../constants/colors.scss';
import useOutsideClick from '../../utils/useOutsideClick';

/*
  Each item in the items array should be similar to the following object:
  {
    title: 'Move to library',
    type: ACTION_TYPE.danger,
    callback: () => dispatch(actions.project.unlinkCardFromView({ id: cardId })),
    icon: LibraryIcon,
  },
  {} renders a separator.
  { colors: { selected, onSelect } } renders a row of colour swatches; the
  menu stays open after a pick so the change is visible.
*/

export const ACTION_TYPE = {
  danger: 'danger',
  bold: 'bold',
  disabled: 'disabled',
};

export const VARIANT_TYPE = {
  dropup: 'dropup',
};

export const ActionDropdown = ({
  btnRef,
  isOpen,
  items,
  onClose,
  variant,
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
    else if (item.colors) {
      const { selected, onSelect } = item.colors;
      itemsList = [
        ...itemsList,
        <li className='color-row' key={'colors' + index}>
          {Object.values(CARD_COLOR_KEYS).map(color => (
            <button
              type='button'
              key={color}
              className={`color-swatch ${color}${selected === color ? ' selected' : ''}`}
              aria-label={color}
              aria-pressed={selected === color}
              title={color}
              onClick={() => onSelect(color)}
            />
          ))}
        </li>
      ];
    }
    else {
      const { title, type, callback, icon } = item;
      itemsList = [
        ...itemsList,
        <li key={title + index}>
          <button
            className='selection'
            onClick={() => {
              callback();
              onClose();
            }}
          >
            <span className={`selection-name ${type ?? ''}`} >{title}</span>
            {icon ? <img className='selection-icon' src={icon} /> : null}
          </button>
        </li>
      ];
    }
  });

  return (
    <div
      className={`action-dropdown ${variant ?? ''}`}
      ref={dropdownRef}
    >
      <ul>
        { itemsList }
      </ul>
    </div>
  );
};

export default ActionDropdown;