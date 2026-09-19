import React, { useRef } from 'react';

import { useMonsterEntryListHooks } from './hooks';
import { MONSTER_FIELDS } from '../../constants/monster';
import MonsterEntry from './MonsterEntry';

import './Card.scss';

// Renders one Combat section (traits/actions/bonusActions/reactions/
// legendaryActions) as a list of little boxes instead of one free-text
// field. Starts empty - just the add button - no blank starter entry.
const MonsterEntryList = ({ cardId, fieldKey, setEditingCard }) => {
  const { entries, canAdd, addEntry, duplicateEntry, deleteEntry } = useMonsterEntryListHooks({ cardId, fieldKey });
  const { singular, namePlaceholder, textPlaceholder } = MONSTER_FIELDS[fieldKey];
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
        <MonsterEntry
          key={entry.id}
          cardId={cardId}
          fieldKey={fieldKey}
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

export default MonsterEntryList;
