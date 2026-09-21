import React, { useRef } from 'react';

import { useNoteEntryListHooks } from './hooks';
import { NOTE_FIELDS } from '../../constants/note';
import NoteEntry from './NoteEntry';

import './Card.scss';

// One open-ended list of "detail" entries - no fixed categories, unlike the
// monster card's Traits/Actions/etc. Near-identical to MonsterEntryList.jsx
// minus the fieldKey/section concept (note only ever has this one
// list), reusing its .monster-entry-list CSS. Starts empty - just the add
// button - no blank starter entry.
const NoteEntryList = ({ cardId, setEditingCard }) => {
  const { entries, canAdd, addEntry, duplicateEntry, deleteEntry } = useNoteEntryListHooks({ cardId });
  const { singular, namePlaceholder, textPlaceholder } = NOTE_FIELDS.entries;
  const addButtonRef = useRef(null);

  // Deleting an entry unmounts its own delete button - without moving focus
  // somewhere real, it falls to <body>, and a stray Backspace/Delete right
  // after would be read by the canvas as "delete the selected card"
  // (useCardShortcutHooks only guards actual text-entry targets).
  const handleDelete = (entryId) => {
    deleteEntry(entryId);
    addButtonRef.current?.focus();
  };

  return (
    <div className='monster-entry-list'>
      {entries.map((entry, index) => (
        <NoteEntry
          key={entry.id}
          cardId={cardId}
          entry={entry}
          index={index}
          singular={singular}
          namePlaceholder={namePlaceholder}
          textPlaceholder={textPlaceholder}
          onDuplicate={duplicateEntry}
          onDelete={handleDelete}
          setEditingCard={setEditingCard}
        />
      ))}
      {canAdd && (
        <button type='button' className='monster-entry-add' onClick={addEntry} ref={addButtonRef}>
          {`+ Add ${singular}`}
        </button>
      )}
    </div>
  );
};

export default NoteEntryList;
