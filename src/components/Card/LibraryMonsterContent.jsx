import React from 'react';
import { useSelector } from 'react-redux';

import { MONSTER_SECTIONS, MONSTER_FIELDS, normalizeMonsterEntries, entryHasContent, abilityModifier, formatModifier } from '../../constants/monster';
import { hasCardContent } from '../../constants/cards';

import './Card.scss';

// Read-only by design, same precedent as LibraryImageContent - LibraryCard
// makes the whole card div draggable, which would fight live inputs.
// Renders no <input>/<textarea> anywhere.
const LibraryMonsterContent = ({
  cardId,
  isExpanded,
  isSelected,
}) => {
  const content = useSelector(state => state.project.present.cards[cardId].content);
  const expanded = isSelected || isExpanded;

  if (!hasCardContent(content)) {
    return (
      <div className='library-card-content-container' style={{ height: '80px' }}>
        <span className='library-monster-empty'>No stat block yet</span>
      </div>
    );
  }

  const { size = '', creatureType = '', alignment = '', armorClass = '', hitPoints = '', challengeRating = '', portrait = '', portraitAlt = '' } = content ?? {};
  const sizeType = [size, creatureType].filter(Boolean).join(' ');
  const line1 = [sizeType, alignment].filter(Boolean).join(', ');
  const line2 = [
    armorClass && `AC ${armorClass}`,
    hitPoints && `HP ${hitPoints}`,
    challengeRating && `CR ${challengeRating}`,
  ].filter(Boolean).join(' · ');

  if (!expanded) {
    return (
      <div className='library-card-content-container library-monster-condensed' style={{ height: '80px' }}>
        {portrait && <img className='library-monster-thumb' src={portrait} alt={portraitAlt} draggable='false' />}
        <div className='library-monster-summary'>
          {line1 && <div className='library-monster-line'>{line1}</div>}
          {line2 && <div className='library-monster-line'>{line2}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className='library-card-content-container library-monster-expanded' style={{ height: '280px' }}>
      {portrait && <img className='library-monster-thumb' src={portrait} alt={portraitAlt} draggable='false' />}
      {MONSTER_SECTIONS.map(section => <LibrarySection key={section.key} content={content} section={section} />)}
      {content.notes?.trim() && (
        <div className='library-monster-section'>
          <div className='library-monster-section-title'>Quick Notes</div>
          <div className='library-monster-field-value prose'>{content.notes}</div>
        </div>
      )}
    </div>
  );
};

const LibrarySection = ({ content, section }) => {
  if (section.layout === 'entries') {
    const fieldKey = section.fields[0];
    const entries = normalizeMonsterEntries(content?.[fieldKey]).filter(entryHasContent);
    if (entries.length === 0) return null;

    return (
      <div className='library-monster-section'>
        <div className='library-monster-section-title'>{section.title}</div>
        {entries.map(entry => (
          <div key={entry.id} className='library-monster-entry'>
            {entry.name && <span className='library-monster-entry-name'>{entry.name}</span>}
            {entry.description && <span className='library-monster-field-value prose'>{entry.description}</span>}
          </div>
        ))}
      </div>
    );
  }

  const filledFields = section.fields.filter(fieldKey => (content?.[fieldKey] ?? '').trim().length > 0);
  if (filledFields.length === 0) return null;

  return (
    <div className='library-monster-section'>
      <div className='library-monster-section-title'>{section.title}</div>
      {filledFields.map(fieldKey => (
        <div key={fieldKey} className='library-monster-field'>
          <span className='library-monster-field-label'>{MONSTER_FIELDS[fieldKey].label}</span>
          <span className={'library-monster-field-value' + (MONSTER_FIELDS[fieldKey]?.multiline ? ' prose' : '')}>
            {fieldKey === 'str' || fieldKey === 'dex' || fieldKey === 'con'
              || fieldKey === 'int' || fieldKey === 'wis' || fieldKey === 'cha'
              ? `${content[fieldKey]} (${formatModifier(abilityModifier(content[fieldKey]))})`
              : content[fieldKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LibraryMonsterContent;
