import React from 'react';

import { useMonsterSectionHooks } from './hooks';
import { MONSTER_COLUMNS, MONSTER_COLUMN_SECTIONS, MONSTER_FIELDS, MONSTER_MEDIA_FIELDS } from '../../constants/monster';
import CollapsibleColumn from './CollapsibleColumn';
import CollapsibleSection from './CollapsibleSection';
import MonsterTextField from './MonsterTextField';
import MonsterSectionBody from './MonsterSectionBody';
import MonsterPortrait from './MonsterPortrait';
import MonsterNotes from './MonsterNotes';

import './Card.scss';

// setEditingCard is passed by Content.jsx but unused here - dragging can
// only start from .input-div in the title bar, so an always-editable
// content input can never start a drag on this card type.
const MonsterContent = ({
  cardId,
}) => {
  const { isCollapsed, sectionContentCount, columnContentCount, toggleSection, toggleColumn } = useMonsterSectionHooks({ cardId });

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
        <div className='monster-media-top'>
          <MonsterPortrait cardId={cardId} />
          <div className='monster-media-fields'>
            {MONSTER_MEDIA_FIELDS.map(fieldKey => (
              <MonsterTextField key={fieldKey} cardId={cardId} fieldKey={fieldKey} {...MONSTER_FIELDS[fieldKey]} />
            ))}
          </div>
        </div>
        <MonsterNotes cardId={cardId} className='monster-notes-field' />
      </div>
      {MONSTER_COLUMNS.map(column => (
        <CollapsibleColumn
          key={column.key}
          title={column.title}
          isCollapsed={isCollapsed(column.key)}
          dotCount={columnContentCount(column.key)}
          onToggle={() => toggleColumn(column.key)}
        >
          {MONSTER_COLUMN_SECTIONS[column.key].map(section => (
            <CollapsibleSection
              key={section.key}
              title={section.title}
              isCollapsed={isCollapsed(section.key)}
              dotCount={sectionContentCount(section.key)}
              onToggle={() => toggleSection(section.key)}
            >
              <MonsterSectionBody cardId={cardId} section={section} />
            </CollapsibleSection>
          ))}
        </CollapsibleColumn>
      ))}
    </div>
  );
};

export default MonsterContent;
