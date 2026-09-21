import React from 'react';

import { useNoteEntryFieldHooks, useDragSafeFieldHooks } from './hooks';
import { NOTE_ENTRY_NAME_MAX_LENGTH, NOTE_ENTRY_TEXT_MAX_LENGTH } from '../../constants/note';

import './Card.scss';
import DuplicateIcon from '../../assets/icons/entry-duplicate.svg';
import TrashIcon from '../../assets/icons/trash-red.svg';

// Near-identical to MonsterEntry.jsx, minus the fieldKey concept (note
// only ever has one entry list) - reuses its .monster-entry* CSS classes
// as-is, they have no monster-specific coupling. See MonsterEntry.jsx for
// the fuller explanation of index/ordinal/id-keying.
const NoteEntry = ({
  cardId,
  entry,
  index,
  singular,
  namePlaceholder,
  textPlaceholder,
  onDuplicate,
  onDelete,
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks); each of the two fields below gates independently
}) => {
  const nameField = useNoteEntryFieldHooks({ cardId, entry, entryFieldKey: 'name' });
  const textField = useNoteEntryFieldHooks({ cardId, entry, entryFieldKey: 'description' });
  const nameGate = useDragSafeFieldHooks({ setEditingCard });
  const textGate = useDragSafeFieldHooks({ setEditingCard });
  const nameId = `note-entry-${cardId}-${entry.id}-name`;
  const textId = `note-entry-${cardId}-${entry.id}-description`;
  const ordinal = `${singular} ${index + 1}`;

  return (
    <div className='monster-entry' role='group' aria-label={ordinal}>
      <div className='monster-entry-controls'>
        <button
          type='button'
          className='monster-entry-duplicate'
          onClick={() => onDuplicate(entry.id)}
          aria-label={`Duplicate ${ordinal}`}
        >
          <img src={DuplicateIcon} alt='' draggable='false' />
        </button>
        <button
          type='button'
          className='monster-entry-delete'
          onClick={() => onDelete(entry.id)}
          aria-label={`Delete ${ordinal}`}
        >
          <img src={TrashIcon} alt='' draggable='false' />
        </button>
      </div>

      <label className='monster-field-label sr-only' htmlFor={nameId}>{`${ordinal} name`}</label>
      <input
        id={nameId}
        ref={nameGate.editRef}
        type='text'
        className='monster-entry-name'
        value={nameField.value}
        placeholder={namePlaceholder}
        maxLength={NOTE_ENTRY_NAME_MAX_LENGTH}
        readOnly={nameGate.readOnly}
        onClick={nameGate.beginEdit}
        onFocus={nameGate.beginEdit}
        onChange={(e) => nameField.changeValue(e.target.value)}
        onBlur={() => { nameField.commit(); nameGate.endEdit(); }}
        onKeyDown={nameField.handleKeyDown}
      />

      <label className='monster-field-label sr-only' htmlFor={textId}>{`${ordinal} description`}</label>
      <textarea
        id={textId}
        ref={textGate.editRef}
        className='monster-field-textarea'
        value={textField.value}
        placeholder={textPlaceholder}
        maxLength={NOTE_ENTRY_TEXT_MAX_LENGTH}
        readOnly={textGate.readOnly}
        onClick={textGate.beginEdit}
        onFocus={textGate.beginEdit}
        onChange={(e) => textField.changeValue(e.target.value)}
        onBlur={() => { textField.commit(); textGate.endEdit(); }}
        onKeyDown={textField.handleKeyDown}
        onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
      />
    </div>
  );
};

export default NoteEntry;
