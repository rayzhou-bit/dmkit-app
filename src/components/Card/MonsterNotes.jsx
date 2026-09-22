import React from 'react';

import { MONSTER_FIELDS } from '../../constants/monster';
import CustomBlockList from './CustomBlockList';

import './Card.scss';

// The monster card's Notes section - a real CustomBlockList (field='notes',
// see applyCustomBlocks/useCustomBlockListHooks's shared-mechanism comments)
// instead of the single free-text field this used to be. Just supplies the
// one thing the shared list doesn't have: a visible/hidden "Notes" heading,
// matching MonsterTextField's hideLabel convention (the Library passes
// hideLabel since its CollapsibleSection header already says "Notes").
const MonsterNotes = ({
  cardId,
  className,
  hideLabel,
  setEditingCard,
}) => (
  <div className={'monster-notes' + (className ? ' ' + className : '')}>
    <div className={'monster-field-label' + (hideLabel ? ' sr-only' : '')}>{MONSTER_FIELDS.notes.label}</div>
    <CustomBlockList cardId={cardId} field='notes' setEditingCard={setEditingCard} />
  </div>
);

export default MonsterNotes;
