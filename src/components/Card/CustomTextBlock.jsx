import React from 'react';

import { useCustomTextBlockHooks, useDragSafeFieldHooks, useCardRefTrigger } from './hooks';
import CardRefField from './CardRefField';
import CardRefPicker from './CardRefPicker';

import './Card.scss';

// A plain freeform textarea - no name/label field, unlike MonsterEntry/
// NoteEntry (a custom block is just "some text" or "an image", nothing
// else). Reuses .monster-field-textarea as-is (no custom-specific CSS
// needed for the text itself - see NoteTextField for the same reuse).
// alwaysToggle: this is one of the 3 surfaces that renders #[Title](id)
// ref tokens as inline chips (see CardRefField) - it needs a real display
// mode on the canvas too, not just in the Library (see
// useDragSafeFieldHooks's comment).
const CustomTextBlock = ({
  cardId,
  field = 'blocks',
  blockId,
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks)
}) => {
  const { value, changeValue, commit, handleKeyDown } = useCustomTextBlockHooks({ cardId, blockId, field });
  const { editRef, readOnly, beginEdit, endEdit } = useDragSafeFieldHooks({ setEditingCard, alwaysToggle: true });
  const refTrigger = useCardRefTrigger({ cardId, editRef, value, changeValue, handleKeyDown });

  return (
    <CardRefField readOnly={readOnly} editRef={editRef} beginEdit={beginEdit} value={value} placeholder='Type anything...' className='monster-field-textarea'>
      <textarea
        ref={editRef}
        className='monster-field-textarea'
        value={value}
        placeholder='Type anything...'
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
  );
};

export default CustomTextBlock;
