import React from 'react';
import { useSelector } from 'react-redux';

import { NOTE_FIELDS } from '../../constants/note';
import { normalizeMonsterEntries } from '../../constants/monster';
import { hasCardContent } from '../../constants/cards';
import NotePortrait from './NotePortrait';
import NoteTextField from './NoteTextField';
import NoteEntryList from './NoteEntryList';

import './Card.scss';

// Deliberately no CollapsibleSection/dots here, unlike LibraryMonsterContent -
// note has no fixed sections to collapse (just a portrait, one
// description field, and one open-ended entry list), matching the design
// goal of staying minimal/freeform rather than mirroring monster's
// structure for its own sake.
const LibraryNoteContent = ({
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
        <span className='library-note-empty'>No note details yet</span>
      </div>
    );
  }

  const { portrait = '', portraitAlt = '', description = '', entries } = content ?? {};

  if (!expanded) {
    const entryNames = normalizeMonsterEntries(entries).map(e => e.name.trim()).filter(Boolean);
    const summaryLine = description.trim() || entryNames.join(', ');

    return (
      <div className='library-card-content-container library-note-condensed' style={{ height: '80px' }}>
        {portrait && <img className='library-note-thumb' src={portrait} alt={portraitAlt} draggable='false' />}
        <div className='library-note-summary'>
          {summaryLine && <div className='library-note-line'>{summaryLine}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className='library-card-content-container library-note-expanded'
      style={{ minHeight: '80px', maxHeight: '60vh', height: 'auto' }}
      onDragOver={(e) => e.preventDefault()}
    >
      <NotePortrait cardId={cardId} />
      <NoteTextField cardId={cardId} fieldKey='description' {...NOTE_FIELDS.description} setEditingCard={setEditingCard} />
      <NoteEntryList cardId={cardId} setEditingCard={setEditingCard} />
    </div>
  );
};

export default LibraryNoteContent;
