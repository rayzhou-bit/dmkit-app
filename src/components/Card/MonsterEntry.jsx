import React from 'react';

import { useMonsterEntryFieldHooks } from './hooks';
import { MONSTER_ENTRY_NAME_MAX_LENGTH, MONSTER_ENTRY_TEXT_MAX_LENGTH } from '../../constants/monster';

import './Card.scss';
import DuplicateIcon from '../../assets/icons/entry-duplicate.svg';
import TrashIcon from '../../assets/icons/trash-red.svg';

// One "box" in a MonsterEntryList - a name + description pair (e.g. one
// action: "Scimitar" / "Melee Weapon Attack: …"), plus duplicate/delete
// controls. `index` is just for the ordinal accessible names ("Action 2") -
// the DOM id is keyed on the stable entry.id so React never reuses an
// input/textarea across entries when the list reorders.
const MonsterEntry = ({
  cardId,
  fieldKey,
  entry,
  index,
  singular,
  namePlaceholder,
  textPlaceholder,
  onDuplicate,
  onDelete,
}) => {
  const nameField = useMonsterEntryFieldHooks({ cardId, fieldKey, entry, entryFieldKey: 'name' });
  const textField = useMonsterEntryFieldHooks({ cardId, fieldKey, entry, entryFieldKey: 'description' });
  const nameId = `monster-entry-${cardId}-${fieldKey}-${entry.id}-name`;
  const textId = `monster-entry-${cardId}-${fieldKey}-${entry.id}-description`;
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
        type='text'
        className='monster-entry-name'
        value={nameField.value}
        placeholder={namePlaceholder}
        maxLength={MONSTER_ENTRY_NAME_MAX_LENGTH}
        onChange={(e) => nameField.changeValue(e.target.value)}
        onBlur={nameField.commit}
        onKeyDown={nameField.handleKeyDown}
      />

      <label className='monster-field-label sr-only' htmlFor={textId}>{`${ordinal} description`}</label>
      <textarea
        id={textId}
        className='monster-field-textarea'
        value={textField.value}
        placeholder={textPlaceholder}
        maxLength={MONSTER_ENTRY_TEXT_MAX_LENGTH}
        onChange={(e) => textField.changeValue(e.target.value)}
        onBlur={textField.commit}
        onKeyDown={textField.handleKeyDown}
        onWheel={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default MonsterEntry;
