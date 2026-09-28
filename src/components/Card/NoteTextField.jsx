import React from 'react';

import { useNoteFieldHooks, useDragSafeFieldHooks, useCardRefTrigger } from './hooks';
import CardRefPicker from './CardRefPicker';

import './Card.scss';

// Note's one scalar field (description) - not generalized like
// MonsterTextField (no icon/numeric/multiline-toggle needs here), but kept
// as its own small component rather than inlined twice, since both
// NoteContent.jsx (canvas) and LibraryNoteContent.jsx (Library)
// need the exact same markup. Reuses .monster-field*/.monster-field-textarea
// CSS as-is.
const NoteTextField = ({
  cardId,
  fieldKey,
  label,
  placeholder,
  hideLabel,
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks)
}) => {
  const { value, changeValue, commit, handleKeyDown } = useNoteFieldHooks({ cardId, fieldKey });
  const { editRef, readOnly, beginEdit, endEdit } = useDragSafeFieldHooks({ setEditingCard });
  const refTrigger = useCardRefTrigger({ cardId, editRef, value, changeValue, handleKeyDown });
  const id = `note-field-${cardId}-${fieldKey}`;

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
        onChange={refTrigger.onChange}
        onBlur={() => { commit(); endEdit(); refTrigger.onBlur(); }}
        onKeyDown={refTrigger.onKeyDown}
        onKeyUp={refTrigger.onKeyUp}
        // Only needed on the canvas, to stop a scroll-to-zoom gesture over
        // the field from also zooming the canvas - see MonsterTextField.
        onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
      />
      {refTrigger.picker && <CardRefPicker {...refTrigger.picker} />}
    </div>
  );
};

export default NoteTextField;
