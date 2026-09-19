import React from 'react';
import { useSelector } from 'react-redux';

import { MONSTER_SECTIONS, MONSTER_FIELDS, normalizeMonsterEntries, entryHasContent, abilityModifier, formatModifier } from '../../constants/monster';
import { hasCardContent } from '../../constants/cards';

import './Card.scss';
import AcShieldIcon from '../../assets/icons/ac-shield.svg';
import HpHeartIcon from '../../assets/icons/hp-heart.svg';
import SpeedBoltIcon from '../../assets/icons/speed-bolt.svg';

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

  const { size = '', creatureType = '', alignment = '', armorClass = '', hitPoints = '', speed = '', challengeRating = '', portrait = '', portraitAlt = '' } = content ?? {};
  const sizeType = [size, creatureType].filter(Boolean).join(' ');
  const subtitle = [sizeType, alignment].filter(Boolean).join(', '); // "Huge dragon (red), chaotic evil"

  if (!expanded) {
    const line2 = [
      armorClass && `AC ${armorClass}`,
      hitPoints && `HP ${hitPoints}`,
      challengeRating && `CR ${challengeRating}`,
    ].filter(Boolean).join(' · ');

    return (
      <div className='library-card-content-container library-monster-condensed' style={{ height: '80px' }}>
        {portrait && <img className='library-monster-thumb' src={portrait} alt={portraitAlt} draggable='false' />}
        <div className='library-monster-summary'>
          {subtitle && <div className='library-monster-line'>{subtitle}</div>}
          {line2 && <div className='library-monster-line'>{line2}</div>}
        </div>
      </div>
    );
  }

  // Icon reused from the main card's chips - AC/HP/Speed live in the Media
  // column there, not MONSTER_SECTIONS, so they need their own row here too.
  const defenseChips = [
    armorClass && { key: 'armorClass', icon: AcShieldIcon, label: 'Armor Class', value: armorClass },
    hitPoints && { key: 'hitPoints', icon: HpHeartIcon, label: 'Hit Points', value: hitPoints },
    speed && { key: 'speed', icon: SpeedBoltIcon, label: 'Speed', value: speed },
  ].filter(Boolean);

  return (
    <div className='library-card-content-container library-monster-expanded' style={{ height: '280px' }}>
      {portrait && <img className='library-monster-thumb' src={portrait} alt={portraitAlt} draggable='false' />}
      {subtitle && <div className='library-monster-subtitle'>{subtitle}</div>}
      {defenseChips.length > 0 && (
        <div className='library-monster-defenses'>
          {defenseChips.map(chip => (
            <span key={chip.key} className='library-monster-defense-chip' title={chip.label}>
              <img className='library-monster-defense-icon' src={chip.icon} alt='' />
              {chip.value}
            </span>
          ))}
        </div>
      )}
      {/* identity (size/type/alignment) is covered by the subtitle above */}
      {MONSTER_SECTIONS.filter(section => section.key !== 'identity').map(section => (
        <LibrarySection key={section.key} content={content} section={section} />
      ))}
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

  if (section.layout === 'abilities') {
    // All 6, not just filled ones (real stat blocks always show the full
    // row) - '—' for a blank score, matching the main card's own convention.
    return (
      <div className='library-monster-section'>
        <div className='library-monster-section-title'>{section.title}</div>
        <div className='library-monster-abilities'>
          {section.fields.map(fieldKey => (
            <div key={fieldKey} className='library-monster-ability'>
              <span className='library-monster-ability-label'>{MONSTER_FIELDS[fieldKey].label}</span>
              <span className='library-monster-ability-score'>{content[fieldKey] || '—'}</span>
              <span className='library-monster-ability-mod'>{formatModifier(abilityModifier(content[fieldKey]))}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='library-monster-section'>
      <div className='library-monster-section-title'>{section.title}</div>
      {filledFields.map(fieldKey => (
        <div key={fieldKey} className='library-monster-field'>
          <span className='library-monster-field-label'>{MONSTER_FIELDS[fieldKey].label}</span>
          <span className={'library-monster-field-value' + (MONSTER_FIELDS[fieldKey]?.multiline ? ' prose' : '')}>
            {content[fieldKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LibraryMonsterContent;
