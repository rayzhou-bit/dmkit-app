import React, { useLayoutEffect, useRef, useState } from 'react';

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

// Edges the menu has to stay inside: the nearest scrolling ancestor if there
// is one (the Library's card list clips its contents), else the viewport.
const scrollBounds = (node) => {
  for (let el = node.parentElement; el; el = el.parentElement) {
    const overflow = getComputedStyle(el).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }
  }
  return { top: 0, bottom: window.innerHeight };
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
  // Flip above when there's no room below - in the Library the menu is
  // clipped by the card list's scroll container. Not VARIANT_TYPE.dropup,
  // which means "38px up from the containing block's bottom" and on a tall
  // card still lands clipped. An explicit `variant` wins.
  const [autoDropup, setAutoDropup] = useState(false);

  useOutsideClick([btnRef, dropdownRef], isOpen, onClose);

  useLayoutEffect(() => {
    if (!isOpen || variant) { setAutoDropup(false); return; }
    const button = btnRef?.current;
    const menu = dropdownRef.current;
    // jsdom reports zeros for both, which would flip everything on every
    // render - treat a measurement of nothing as "leave it alone".
    if (!button || !menu || !menu.offsetHeight) return;
    const rect = button.getBoundingClientRect();
    const bounds = scrollBounds(button);
    const fitsBelow = rect.bottom + menu.offsetHeight <= bounds.bottom;
    const fitsAbove = rect.top - menu.offsetHeight >= bounds.top;
    setAutoDropup(!fitsBelow && fitsAbove);
  }, [isOpen, variant, items]);

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
      className={`action-dropdown ${variant ?? (autoDropup ? 'flip-above' : '')}`}
      ref={dropdownRef}
    >
      <ul>
        { itemsList }
      </ul>
    </div>
  );
};

export default ActionDropdown;