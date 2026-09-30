import React from 'react';

import { useNoteFieldHooks, useDragSafeFieldHooks, useCardRefTrigger } from './hooks';
import CardRefField from './CardRefField';
import CardRefPicker from './CardRefPicker';

import './Card.scss';

// Note's one scalar field (description) - not generalized like
// MonsterTextField (no icon/numeric/multiline-toggle needs here), but kept
// as its own small component rather than inlined twice, since both
// NoteContent.jsx (canvas) and LibraryNoteContent.jsx (Library)
// need the exact same markup. Reuses .monster-field*/.monster-field-textarea
// CSS as-is.
// Supports #[Title](id) card references, same as CustomTextBlock (see
// CardRefField/CardRefDisplay) - alwaysToggle is required there for the
// same reason: without it, the canvas (setEditingCard === undefined) would
// stay always-editable and never get a display mode to render chips into.
const NoteTextField = ({
  cardId,
  fieldKey,
  label,
  placeholder,
  hideLabel,
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks)
}) => {
  const { value, changeValue, commit, handleKeyDown } = useNoteFieldHooks({ cardId, fieldKey });
  const { editRef, readOnly, beginEdit, endEdit } = useDragSafeFieldHooks({ setEditingCard, alwaysToggle: true });
  const refTrigger = useCardRefTrigger({ cardId, editRef, value, changeValue, handleKeyDown });
  const id = `note-field-${cardId}-${fieldKey}`;

  return (
    <div className='monster-field'>
      <label className={'monster-field-label' + (hideLabel ? ' sr-only' : '')} htmlFor={id}>{label}</label>
      <CardRefField readOnly={readOnly} editRef={editRef} beginEdit={beginEdit} value={value} placeholder={placeholder} className='monster-field-textarea'>
        <textarea
          id={id}
          ref={editRef}
          className='monster-field-textarea'
          value={value}
          placeholder={placeholder}
          onChange={refTrigger.onChange}
          onBlur={() => { commit(); endEdit(); refTrigger.onBlur(); }}
          onKeyDown={refTrigger.onKeyDown}
          onKeyUp={refTrigger.onKeyUp}
          // Only needed on the canvas, to stop a scroll-to-zoom gesture over
          // the field from also zooming the canvas - see MonsterTextField.
          onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
        />
        {refTrigger.picker && <CardRefPicker {...refTrigger.picker} />}
      </CardRefField>
    </div>
  );
};

export default NoteTextField;
