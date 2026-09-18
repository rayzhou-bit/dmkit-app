import React, { useState } from 'react';

import { useMonsterSectionHooks } from './hooks';
import { MONSTER_COLUMNS, MONSTER_COLUMN_SECTIONS, MONSTER_FIELDS, abilityModifier, formatModifier } from '../../constants/monster';
import CollapsibleColumn from './CollapsibleColumn';
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
  const { isCollapsed, sectionHasContent, columnHasContent, toggleSection, toggleColumn } = useMonsterSectionHooks({ cardId });

  const collapsedModifierClasses = MONSTER_COLUMNS
    .filter(column => isCollapsed(column.key))
    .map(column => `monster-content-${column.key}-collapsed`)
    .join(' ');

  return (
    <div
      className={'card-content monster-content' + (collapsedModifierClasses ? ' ' + collapsedModifierClasses : '')}
      onWheel={(e) => e.stopPropagation()}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className='monster-column-media'>
        <MonsterPortrait cardId={cardId} />
        <MonsterTextField cardId={cardId} fieldKey='notes' {...MONSTER_FIELDS.notes} className='monster-notes-field' />
      </div>
      {MONSTER_COLUMNS.map(column => (
        <CollapsibleColumn
          key={column.key}
          title={column.title}
          isCollapsed={isCollapsed(column.key)}
          hasContent={columnHasContent(column.key)}
          onToggle={() => toggleColumn(column.key)}
        >
          {MONSTER_COLUMN_SECTIONS[column.key].map(section => (
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
        </CollapsibleColumn>
      ))}
    </div>
  );
};

const SectionBody = ({ cardId, section }) => {
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
