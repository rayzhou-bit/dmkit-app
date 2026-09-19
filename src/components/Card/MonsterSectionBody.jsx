import React, { useState } from 'react';

import { MONSTER_FIELDS, abilityModifier, formatModifier } from '../../constants/monster';
import MonsterTextField from './MonsterTextField';
import MonsterEntryList from './MonsterEntryList';

import './Card.scss';

// Shared by the canvas card (MonsterContent) and the Library card - renders
// one section's fields per its layout. setEditingCard is optional (only
// meaningful inside a Library card - see useDragSafeFieldHooks) and just
// threads straight through to every field.
const MonsterSectionBody = ({ cardId, section, setEditingCard }) => {
  if (section.layout === 'abilities') {
    return (
      <div className='monster-abilities'>
        {section.fields.map(fieldKey => (
          <AbilityCell key={fieldKey} cardId={cardId} fieldKey={fieldKey} setEditingCard={setEditingCard} />
        ))}
      </div>
    );
  }

  if (section.layout === 'entries') {
    // One field per section for all 5 (field key === section key).
    return <MonsterEntryList cardId={cardId} fieldKey={section.fields[0]} setEditingCard={setEditingCard} />;
  }

  // 'lines'
  return (
    <div className='monster-lines'>
      {section.fields.map(fieldKey => (
        <MonsterTextField key={fieldKey} cardId={cardId} fieldKey={fieldKey} {...MONSTER_FIELDS[fieldKey]} setEditingCard={setEditingCard} />
      ))}
    </div>
  );
};

const AbilityCell = ({ cardId, fieldKey, setEditingCard }) => {
  // Fed live (uncommitted) values via onValueChange, so the modifier updates
  // as you type, not just after the field commits on blur.
  const [score, setScore] = useState('');
  const modifier = formatModifier(abilityModifier(score));

  return (
    <div className='monster-ability-cell'>
      <MonsterTextField
        cardId={cardId}
        fieldKey={fieldKey}
        {...MONSTER_FIELDS[fieldKey]}
        className='monster-ability-score'
        onValueChange={setScore}
        setEditingCard={setEditingCard}
      />
      <span className='monster-ability-modifier'>{modifier}</span>
    </div>
  );
};

export default MonsterSectionBody;
