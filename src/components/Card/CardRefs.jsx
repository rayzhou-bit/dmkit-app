import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../../data/redux';
import { normalizeCardRefs } from '../../constants/cards';

import './Card.scss';

// Resolves each ref id to the live card at render time (so a rename just
// works) rather than storing a snapshot of the title. A ref to a deleted
// card renders as a dangling, non-navigating chip - we don't cascade-
// delete refs, so an undo of the delete restores a working link.
const CardRefs = ({ cardId }) => {
  const dispatch = useDispatch();
  const cards = useSelector(state => state.project.present.cards);
  const refs = normalizeCardRefs(cards[cardId]?.refs);

  if (!refs.length) return null;

  return (
    <div className='card-refs'>
      {refs.map(refId => {
        const target = cards[refId];
        return (
          <span key={refId} className={'card-ref-chip' + (target ? '' : ' card-ref-chip-dangling')}>
            <button
              type='button'
              className='card-ref-chip-label'
              disabled={!target}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(actions.session.focusCard({ cardId: refId }));
              }}
            >
              {target ? target.title : 'Deleted card'}
            </button>
            <button
              type='button'
              className='card-ref-chip-remove'
              aria-label={`Remove reference to ${target ? target.title : 'deleted card'}`}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(actions.project.removeCardRef({ id: cardId, refId }));
              }}
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
};

export default CardRefs;
