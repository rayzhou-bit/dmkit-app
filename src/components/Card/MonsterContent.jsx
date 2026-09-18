import React, { useState } from 'react';

import { useMonsterSectionHooks } from './hooks';
import { MONSTER_SECTIONS, MONSTER_FIELDS, abilityModifier, formatModifier } from '../../constants/monster';
import CollapsibleSection from './CollapsibleSection';
import MonsterTextField from './MonsterTextField';
import MonsterPortrait from './MonsterPortrait';

import './Card.scss';

// setEditingCard is passed by Content.jsx but unused here - dragging can
// only start from .input-div in the title bar, so an always-editable
// content input can never start a drag on this card type.
const MonsterContent = ({
  cardId,
}) => {
  const { isCollapsed, sectionHasContent, toggleSection } = useMonsterSectionHooks({ cardId });

  return (
    <div className='card-content monster-content' onWheel={(e) => e.stopPropagation()} onDragOver={(e) => e.preventDefault()}>
      {MONSTER_SECTIONS.map(section => (
        <CollapsibleSection
          key={section.key}
          title={section.title}
          isCollapsed={isCollapsed(section.key)}
          hasContent={sectionHasContent(section.key)}
          onToggle={() => toggleSection(section.key)}
        >
          <SectionBody cardId={cardId} section={section} />
        </CollapsibleSection>
      ))}
    </div>
  );
};

const SectionBody = ({ cardId, section }) => {
  if (section.layout === 'header') {
    return (
      <div className='monster-header'>
        <MonsterPortrait cardId={cardId} />
        <div className='monster-header-fields'>
          {section.fields.map(fieldKey => (
            <MonsterTextField key={fieldKey} cardId={cardId} fieldKey={fieldKey} {...MONSTER_FIELDS[fieldKey]} />
          ))}
        </div>
      </div>
    );
  }

  if (section.layout === 'abilities') {
    return (
      <div className='monster-abilities'>
        {section.fields.map(fieldKey => (
          <AbilityCell key={fieldKey} cardId={cardId} fieldKey={fieldKey} />
        ))}
      </div>
    );
  }

  if (section.layout === 'prose') {
    return section.fields.map(fieldKey => (
      <MonsterTextField key={fieldKey} cardId={cardId} fieldKey={fieldKey} {...MONSTER_FIELDS[fieldKey]} className='monster-field-prose' />
    ));
  }

  // 'lines'
  return (
    <div className='monster-lines'>
      {section.fields.map(fieldKey => (
        <MonsterTextField key={fieldKey} cardId={cardId} fieldKey={fieldKey} {...MONSTER_FIELDS[fieldKey]} />
      ))}
    </div>
  );
};

const AbilityCell = ({ cardId, fieldKey }) => {
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
      />
      <span className='monster-ability-modifier'>{modifier}</span>
    </div>
  );
};

export default MonsterContent;
