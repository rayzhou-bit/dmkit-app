import React from 'react';
import { useSelector } from 'react-redux';

import { LOCATION_FIELDS } from '../../constants/location';
import { normalizeMonsterEntries } from '../../constants/monster';
import { hasCardContent } from '../../constants/cards';
import LocationPortrait from './LocationPortrait';
import LocationTextField from './LocationTextField';
import LocationEntryList from './LocationEntryList';

import './Card.scss';

// Deliberately no CollapsibleSection/dots here, unlike LibraryMonsterContent -
// location has no fixed sections to collapse (just a portrait, one
// description field, and one open-ended entry list), matching the design
// goal of staying minimal/freeform rather than mirroring monster's
// structure for its own sake.
const LibraryLocationContent = ({
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
        <span className='library-location-empty'>No location details yet</span>
      </div>
    );
  }

  const { portrait = '', portraitAlt = '', description = '', entries } = content ?? {};

  if (!expanded) {
    const entryNames = normalizeMonsterEntries(entries).map(e => e.name.trim()).filter(Boolean);
    const summaryLine = description.trim() || entryNames.join(', ');

    return (
      <div className='library-card-content-container library-location-condensed' style={{ height: '80px' }}>
        {portrait && <img className='library-location-thumb' src={portrait} alt={portraitAlt} draggable='false' />}
        <div className='library-location-summary'>
          {summaryLine && <div className='library-location-line'>{summaryLine}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className='library-card-content-container library-location-expanded'
      style={{ minHeight: '80px', maxHeight: '60vh', height: 'auto' }}
      onDragOver={(e) => e.preventDefault()}
    >
      <LocationPortrait cardId={cardId} />
      <LocationTextField cardId={cardId} fieldKey='description' {...LOCATION_FIELDS.description} setEditingCard={setEditingCard} />
      <LocationEntryList cardId={cardId} setEditingCard={setEditingCard} />
    </div>
  );
};

export default LibraryLocationContent;
