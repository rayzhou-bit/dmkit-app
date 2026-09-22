import React, { useRef } from 'react';

import { useCustomBlockListHooks } from './hooks';
import { CUSTOM_BLOCK_TYPES } from '../../constants/custom';
import CustomBlock from './CustomBlock';

import './Card.scss';

// The open-ended block list + the two always-visible "add" buttons -
// shared between the canvas (CustomContent.jsx) and the Library
// (LibraryCustomContent.jsx), same split as NoteEntryList.jsx. Starts
// empty - just the two add buttons - no blank starter block (monster's
// Notes section, field='notes', is the one exception - see
// buildMonsterContent's starter block; this component doesn't need to know
// about that, it just renders whatever blocks the hook gives it).
//
// field: 'blocks' (default, the custom card) or 'notes' (monster's Notes
// section, via MonsterNotes.jsx) - see useCustomBlockListHooks's comment.
const CustomBlockList = ({ cardId, field = 'blocks', setEditingCard }) => {
  const { blocks, canAdd, addTextBlock, addImageBlock, duplicateBlock, deleteBlock } = useCustomBlockListHooks({ cardId, field });
  const addTextButtonRef = useRef(null);
  const addImageButtonRef = useRef(null);

  // Deleting a block unmounts its own delete button - without moving focus
  // somewhere real, it falls to <body>, and a stray Backspace/Delete right
  // after would be read by the canvas as "delete the selected card"
  // (useCardShortcutHooks only guards actual text-entry targets). Focuses
  // whichever add button matches the deleted block's own type.
  const handleDelete = (blockId) => {
    const deletedType = blocks.find(b => b.id === blockId)?.type;
    deleteBlock(blockId);
    (deletedType === CUSTOM_BLOCK_TYPES.image ? addImageButtonRef : addTextButtonRef).current?.focus();
  };

  return (
    <>
      {blocks.map((block, index) => (
        <CustomBlock
          key={block.id}
          cardId={cardId}
          field={field}
          block={block}
          index={index}
          onDuplicate={duplicateBlock}
          onDelete={handleDelete}
          setEditingCard={setEditingCard}
        />
      ))}
      {canAdd && (
        <div className='custom-block-add-row'>
          <button type='button' className='custom-block-add' onClick={addTextBlock} ref={addTextButtonRef}>
            + Add text
          </button>
          <button type='button' className='custom-block-add' onClick={addImageBlock} ref={addImageButtonRef}>
            + Add image
          </button>
        </div>
      )}
    </>
  );
};

export default CustomBlockList;
