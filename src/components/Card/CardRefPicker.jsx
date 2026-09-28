import React from 'react';
import { createPortal } from 'react-dom';

import './CardRefPicker.scss';

const PICKER_HEIGHT_ESTIMATE = 220; // rough cap used only to decide flip direction

// Portal is load-bearing, not stylistic: .card-content is overflow:hidden
// (Card.scss) so an in-flow popup would get clipped, and on the canvas the
// host field lives inside a scaled/translated node - positioning from its
// own getBoundingClientRect() and rendering into document.body sidesteps
// both, at any zoom level.
// onMouseDown here does two things at once: preventDefault keeps focus (and
// selection) on the host textarea so a click doesn't blur it before the
// click lands, and stopPropagation keeps the mousedown from ever reaching
// the Library card's own outside-click handler (useLibraryCardHooks), which
// would otherwise force-blur the field and tear this picker down first.
const CardRefPicker = ({ rect, results, highlightedIndex, onSelect, onHighlight }) => {
  if (!rect) return null;

  const flipUp = rect.bottom + PICKER_HEIGHT_ESTIMATE > window.innerHeight;
  const style = {
    position: 'fixed',
    left: rect.left,
    minWidth: rect.width,
    ...(flipUp
      ? { bottom: window.innerHeight - rect.top, maxHeight: rect.top - 8 }
      : { top: rect.bottom, maxHeight: window.innerHeight - rect.bottom - 8 }),
  };

  return createPortal(
    <div
      className='card-ref-picker'
      style={style}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {results.length === 0 ? (
        <div className='card-ref-picker-empty'>No matching cards</div>
      ) : (
        <ul className='card-ref-picker-list'>
          {results.map((card, index) => (
            <li key={card.id}>
              <button
                type='button'
                className={'card-ref-picker-option' + (index === highlightedIndex ? ' highlighted' : '')}
                onMouseEnter={() => onHighlight(index)}
                onClick={() => onSelect(card)}
              >
                {card.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body
  );
};

export default CardRefPicker;
