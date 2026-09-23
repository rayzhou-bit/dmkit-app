import React from 'react';
import { useSelector } from 'react-redux';

import { MONSTER_COLUMN_SECTIONS, MONSTER_FIELDS, MONSTER_MEDIA_FIELDS, MONSTER_MAX_DOTS, normalizeNotesBlocks } from '../../constants/monster';
import { customBlockHasContent } from '../../constants/custom';
import { hasCardContent } from '../../constants/cards';
import { useMonsterSectionHooks } from './hooks';
import CollapsibleSection from './CollapsibleSection';
import MonsterTextField from './MonsterTextField';
import MonsterSectionBody from './MonsterSectionBody';
import MonsterPortrait from './MonsterPortrait';
import MonsterNotes from './MonsterNotes';

import './Card.scss';

// The Library's own top-level grouping for Stats/Combat - 'attributes'/
// 'combat' reuse the canvas's column keys (same sections inside). Notes is
// handled separately, right below (see LibraryMonsterExpanded) - still
// collapsible (unlike the canvas, where it's always-visible), but
// positioned next to the picture like on the canvas, not listed as a third
// group here.
const LIBRARY_GROUPS = [
  { key: 'attributes', title: 'Stats' },
  { key: 'combat', title: 'Combat' },
];

// The condensed (80px, unselected) card stays read-only, same as before -
// setEditingCard is only ever exercised by the expanded view below.
const LibraryMonsterContent = ({
  cardId,
  isExpanded,
  isSelected,
  setEditingCard,
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

  return (
    <LibraryMonsterExpanded
      cardId={cardId}
      content={content}
      subtitle={subtitle}
      setEditingCard={setEditingCard}
    />
  );
};

// Fields are real editable inputs here (see MonsterTextField/MonsterEntry's
// setEditingCard plumbing and useDragSafeFieldHooks) - so, unlike the old
// read-only preview, empty fields render too (with their placeholder) - you
// can't type a value into a field you can never see. Collapse + the dot
// indicators (reused as-is from the canvas) keep an all-empty section from
// just being noise.
const LibraryMonsterExpanded = ({ cardId, content, subtitle, setEditingCard }) => {
  const { isCollapsed, sectionContentCount, columnContentCount, toggleSection } =
    useMonsterSectionHooks({ cardId, scope: 'library' });
  const notesDotCount = Math.min(normalizeNotesBlocks(content?.notes).filter(customBlockHasContent).length, MONSTER_MAX_DOTS);

  return (
    <div
      className='library-card-content-container library-monster-expanded library-monster-editable'
      style={{ minHeight: '80px', maxHeight: '60vh', height: 'auto' }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className='library-monster-media-top'>
        <MonsterPortrait cardId={cardId} />
        <div className='library-monster-defenses'>
          {MONSTER_MEDIA_FIELDS.map(fieldKey => (
            <MonsterTextField key={fieldKey} cardId={cardId} fieldKey={fieldKey} {...MONSTER_FIELDS[fieldKey]} setEditingCard={setEditingCard} />
          ))}
        </div>
      </div>
      {subtitle && <div className='library-monster-subtitle'>{subtitle}</div>}

      <CollapsibleSection
        title='Notes'
        isCollapsed={isCollapsed('notes')}
        dotCount={notesDotCount}
        onToggle={() => toggleSection('notes')}
      >
        <MonsterNotes cardId={cardId} hideLabel setEditingCard={setEditingCard} />
      </CollapsibleSection>

      {LIBRARY_GROUPS.map(group => (
        <CollapsibleSection
          key={group.key}
          title={group.title}
          isCollapsed={isCollapsed(group.key)}
          dotCount={columnContentCount(group.key)}
          onToggle={() => toggleSection(group.key)}
        >
          {MONSTER_COLUMN_SECTIONS[group.key].map(section => (
            <CollapsibleSection
              key={section.key}
              title={section.title}
              isCollapsed={isCollapsed(section.key)}
              dotCount={sectionContentCount(section.key)}
              onToggle={() => toggleSection(section.key)}
            >
              <MonsterSectionBody cardId={cardId} section={section} setEditingCard={setEditingCard} />
            </CollapsibleSection>
          ))}
        </CollapsibleSection>
      ))}
    </div>
  );
};

export default LibraryMonsterContent;
