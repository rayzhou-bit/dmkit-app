import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { actions } from '../../data/redux';
import { parseCardRefs } from '../../utils/cardRefToken';

import './Card.scss';

// Renders a card's raw text (which may contain #[Title](id) tokens) as
// flowing text with inline ref chips - the live-resolved title, not the
// token's own title hint, so renaming the target just works. Each segment
// carries its raw start/end offset as a data attribute so a click can be
// mapped back to a caret position in the raw string (see CardRefField,
// which owns the mousedown handler passed in as `onMouseDown`).
// className is deliberately the *same* class the host textarea uses
// (e.g. 'text', 'monster-field-textarea') so font/padding/line-height/width
// come from the existing rule for free - see Card.scss's .card-ref-display
// for the couple of display-only additions (white-space, cursor).
const CardRefDisplay = React.forwardRef(({ text, placeholder, className, onMouseDown }, ref) => {
  const dispatch = useDispatch();
  const segments = parseCardRefs(text);
  const refIds = segments.filter(s => s.type === 'ref').map(s => s.id);

  // Selects resolved titles (or null for a deleted target), not the raw
  // `cards` map - a couple of reasons: it's the only piece of state this
  // component actually needs, and selecting down to primitives lets
  // shallowEqual bail out correctly even against hand-rolled fake stores in
  // this repo's tests that rebuild `cards` (and every card in it) as fresh
  // objects on every getState() call - selecting the map itself would defeat
  // useSelector's equality check on every one of those and infinite-loop
  // (same class of bug as useCustomBlockListHooks' comment).
  const titles = useSelector(
    state => refIds.map(id => state.project.present.cards[id]?.title ?? null),
    shallowEqual,
  );

  return (
    <div ref={ref} className={`${className} card-ref-display`} onMouseDown={onMouseDown}>
      {segments.length === 0 ? (
        <span className='card-ref-placeholder' data-ref-start={0}>{placeholder}</span>
      ) : segments.map((seg, i) => (
        seg.type === 'text' ? (
          <span key={i} data-ref-start={seg.start}>{seg.text}</span>
        ) : (
          <RefChip key={i} seg={seg} title={titles[refIds.indexOf(seg.id)]} dispatch={dispatch} />
        )
      ))}
    </div>
  );
});

const RefChip = ({ seg, title, dispatch }) => {
  const exists = title !== null;
  return (
    <span
      className={'card-ref-chip-inline' + (exists ? '' : ' card-ref-chip-inline-dangling')}
      data-ref-chip='true'
      data-ref-start={seg.end}
      // Without this, an unrelated card's own mousedown-driven reflow
      // (verified with several intro cards on the canvas at once) can land
      // the mouseup on a different element entirely, so the browser never
      // synthesizes a click on the chip at all.
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (!exists) return;
        e.stopPropagation();
        dispatch(actions.session.focusCard({ cardId: seg.id }));
      }}
    >
      {exists ? title : 'Deleted card'}
    </span>
  );
};

export default CardRefDisplay;
