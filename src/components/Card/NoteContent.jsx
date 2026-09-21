import React from 'react';

import { NOTE_FIELDS } from '../../constants/note';
import NotePortrait from './NotePortrait';
import NoteTextField from './NoteTextField';
import NoteEntryList from './NoteEntryList';

import './Card.scss';

// Canvas body for the note card type - deliberately simple/single-
// column compared to MonsterContent's two collapsible columns: an optional
// portrait, one freeform description, one open-ended entry list. Nothing
// here is required - see constants/note.js's noteHasContent.
const NoteContent = ({ cardId }) => (
  <div className='note-content'>
    <NotePortrait cardId={cardId} />
    <NoteTextField cardId={cardId} fieldKey='description' {...NOTE_FIELDS.description} />
    <NoteEntryList cardId={cardId} />
  </div>
);

export default NoteContent;
