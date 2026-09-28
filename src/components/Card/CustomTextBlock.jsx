import React from 'react';

import { useCustomTextBlockHooks, useDragSafeFieldHooks, useCardRefTrigger } from './hooks';
import CardRefPicker from './CardRefPicker';

import './Card.scss';

// A plain freeform textarea - no name/label field, unlike MonsterEntry/
// NoteEntry (a custom block is just "some text" or "an image", nothing
// else). Reuses .monster-field-textarea as-is (no custom-specific CSS
// needed for the text itself - see NoteTextField for the same reuse).
const CustomTextBlock = ({
  cardId,
  field = 'blocks',
  blockId,
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks)
}) => {
  const { value, changeValue, commit, handleKeyDown } = useCustomTextBlockHooks({ cardId, blockId, field });
  const { editRef, readOnly, beginEdit, endEdit } = useDragSafeFieldHooks({ setEditingCard });
  const refTrigger = useCardRefTrigger({ cardId, editRef, value, changeValue, handleKeyDown });

  return (
    <>
      <textarea
        ref={editRef}
        className='monster-field-textarea'
        value={value}
        placeholder='Type anything...'
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
    </>
  );
};

export default CustomTextBlock;
