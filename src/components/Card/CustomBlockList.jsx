import React, { useRef } from 'react';

import { useCustomBlockListHooks } from './hooks';
import { CUSTOM_BLOCK_TYPES } from '../../constants/custom';
import CustomBlock from './CustomBlock';

import './Card.scss';

// The open-ended block list - shared between the canvas (CustomContent.jsx)
// and the Library (LibraryCustomContent.jsx), same split as
// NoteEntryList.jsx, and also reused by MonsterNotes.jsx (field='notes').
//
// field: 'blocks' (default, the custom card) or 'notes' (monster's Notes
// section) - see useCustomBlockListHooks's comment. The custom card adds
// blocks from the "+" dropdown on its own title bar (see
// useAddBlockDropdownHooks) instead of a row here, since every custom card
// already has that dropdown; monster cards don't get one just for Notes,
// so Notes keeps the always-visible add-button row this list used to
// always render.
const CustomBlockList = ({ cardId, field = 'blocks', setEditingCard, focusFallbackRef }) => {
  const { blocks, canAdd, addTextBlock, addImageBlock, duplicateBlock, deleteBlock } = useCustomBlockListHooks({ cardId, field });
  const showAddRow = field !== 'blocks';
  const addTextButtonRef = useRef(null);
  const addImageButtonRef = useRef(null);

  // Deleting a block unmounts its own delete button - without moving focus
  // somewhere real, it falls to <body>, and a stray Backspace/Delete right
  // after would be read by the canvas as "delete the selected card"
  // (useCardShortcutHooks only guards actual text-entry targets). The
  // custom card (no add row) falls back to its own content container
  // (focusFallbackRef, from CustomContent/LibraryCustomContent); monster
  // Notes (still has the add row) falls back to whichever add button
  // matches the deleted block's own type, same as this used to work for
  // both cases before the custom card grew its title-bar dropdown.
  const handleDelete = (blockId) => {
    const deletedType = blocks.find(b => b.id === blockId)?.type;
    deleteBlock(blockId);
    if (showAddRow) {
      (deletedType === CUSTOM_BLOCK_TYPES.image ? addImageButtonRef : addTextButtonRef).current?.focus();
    } else {
      focusFallbackRef?.current?.focus();
    }
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
      {showAddRow && canAdd && (
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
