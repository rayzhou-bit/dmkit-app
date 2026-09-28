import React from 'react';

import { useMonsterEntryFieldHooks, useDragSafeFieldHooks, useCardRefTrigger } from './hooks';
import { MONSTER_ENTRY_NAME_MAX_LENGTH, MONSTER_ENTRY_TEXT_MAX_LENGTH } from '../../constants/monster';
import CardRefPicker from './CardRefPicker';

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
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks); each of the two fields below gates independently
}) => {
  const nameField = useMonsterEntryFieldHooks({ cardId, fieldKey, entry, entryFieldKey: 'name' });
  const textField = useMonsterEntryFieldHooks({ cardId, fieldKey, entry, entryFieldKey: 'description' });
  const nameGate = useDragSafeFieldHooks({ setEditingCard });
  const textGate = useDragSafeFieldHooks({ setEditingCard });
  const refTrigger = useCardRefTrigger({
    cardId, editRef: textGate.editRef, value: textField.value, changeValue: textField.changeValue, handleKeyDown: textField.handleKeyDown,
  });
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
        ref={nameGate.editRef}
        type='text'
        className='monster-entry-name'
        value={nameField.value}
        placeholder={namePlaceholder}
        maxLength={MONSTER_ENTRY_NAME_MAX_LENGTH}
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
        maxLength={MONSTER_ENTRY_TEXT_MAX_LENGTH}
        readOnly={textGate.readOnly}
        onClick={textGate.beginEdit}
        onFocus={textGate.beginEdit}
        onChange={refTrigger.onChange}
        onBlur={() => { textField.commit(); textGate.endEdit(); refTrigger.onBlur(); }}
        onKeyDown={refTrigger.onKeyDown}
        onKeyUp={refTrigger.onKeyUp}
        onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
      />
      {refTrigger.picker && <CardRefPicker {...refTrigger.picker} />}
    </div>
  );
};

export default MonsterEntry;
