import React from 'react';

import { useLocationFieldHooks, useDragSafeFieldHooks } from './hooks';

import './Card.scss';

// Location's one scalar field (description) - not generalized like
// MonsterTextField (no icon/numeric/multiline-toggle needs here), but kept
// as its own small component rather than inlined twice, since both
// LocationContent.jsx (canvas) and LibraryLocationContent.jsx (Library)
// need the exact same markup. Reuses .monster-field*/.monster-field-textarea
// CSS as-is.
const LocationTextField = ({
  cardId,
  fieldKey,
  label,
  placeholder,
  hideLabel,
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks)
}) => {
  const { value, changeValue, commit, handleKeyDown } = useLocationFieldHooks({ cardId, fieldKey });
  const { editRef, readOnly, beginEdit, endEdit } = useDragSafeFieldHooks({ setEditingCard });
  const id = `location-field-${cardId}-${fieldKey}`;

  return (
    <div className='monster-field'>
      <label className={'monster-field-label' + (hideLabel ? ' sr-only' : '')} htmlFor={id}>{label}</label>
      <textarea
        id={id}
        ref={editRef}
        className='monster-field-textarea'
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onClick={beginEdit}
        onFocus={beginEdit}
        onChange={(e) => changeValue(e.target.value)}
        onBlur={() => { commit(); endEdit(); }}
        onKeyDown={handleKeyDown}
        // Only needed on the canvas, to stop a scroll-to-zoom gesture over
        // the field from also zooming the canvas - see MonsterTextField.
        onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
      />
    </div>
  );
};

export default LocationTextField;
