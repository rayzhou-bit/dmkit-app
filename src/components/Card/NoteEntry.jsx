import React from 'react';

import { useNoteEntryFieldHooks, useDragSafeFieldHooks, useCardRefTrigger } from './hooks';
import { NOTE_ENTRY_NAME_MAX_LENGTH, NOTE_ENTRY_TEXT_MAX_LENGTH } from '../../constants/note';
import CardRefField from './CardRefField';
import CardRefPicker from './CardRefPicker';

import './Card.scss';
import DuplicateIcon from '../../assets/icons/entry-duplicate.svg';
import TrashIcon from '../../assets/icons/trash-red.svg';

// Near-identical to MonsterEntry.jsx, minus the fieldKey concept (note
// only ever has one entry list) - reuses its .monster-entry* CSS classes
// as-is, they have no monster-specific coupling. See MonsterEntry.jsx for
// the fuller explanation of index/ordinal/id-keying.
// The description textarea supports #[Title](id) card references, same as
// NoteTextField/CustomTextBlock (see CardRefField) - the name input doesn't:
// it's a short single-line title with a maxLength, not prose, so it keeps
// its plain onClick/onFocus/readOnly wiring unchanged.
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
  const textGate = useDragSafeFieldHooks({ setEditingCard, alwaysToggle: true });
  const textRefTrigger = useCardRefTrigger({
    cardId, editRef: textGate.editRef, value: textField.value, changeValue: textField.changeValue, handleKeyDown: textField.handleKeyDown,
  });
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
      <CardRefField readOnly={textGate.readOnly} editRef={textGate.editRef} beginEdit={textGate.beginEdit} value={textField.value} placeholder={textPlaceholder} className='monster-field-textarea'>
        <textarea
          id={textId}
          ref={textGate.editRef}
          className='monster-field-textarea'
          value={textField.value}
          placeholder={textPlaceholder}
          maxLength={NOTE_ENTRY_TEXT_MAX_LENGTH}
          onChange={textRefTrigger.onChange}
          onBlur={() => { textField.commit(); textGate.endEdit(); textRefTrigger.onBlur(); }}
          onKeyDown={textRefTrigger.onKeyDown}
          onKeyUp={textRefTrigger.onKeyUp}
          onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
        />
        {textRefTrigger.picker && <CardRefPicker {...textRefTrigger.picker} />}
      </CardRefField>
    </div>
  );
};

export default NoteEntry;
