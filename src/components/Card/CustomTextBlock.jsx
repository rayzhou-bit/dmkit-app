import React from 'react';

import { useCustomTextBlockHooks, useDragSafeFieldHooks } from './hooks';

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

  return (
    <textarea
      ref={editRef}
      className='monster-field-textarea'
      value={value}
      placeholder='Type anything...'
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
  );
};

export default CustomTextBlock;
