import React, { useEffect } from 'react';

import { useMonsterFieldHooks, useDragSafeFieldHooks } from './hooks';

import './Card.scss';

// Explicit htmlFor/id, not a wrapping <label> - a wrapped <textarea>'s value
// is part of its own textContent, so a wrapping label's computed accessible
// name would grow to include whatever the user just typed.
const MonsterTextField = ({
  cardId,
  fieldKey,
  label,
  placeholder,
  maxLength,
  multiline,
  numeric,
  className,
  hideLabel,
  icon, // optional - replaces the visible text label with an icon + hover tooltip (label stays as the a11y name)
  onValueChange, // optional - notified of the local (uncommitted) value live, e.g. for the ability modifier
  setEditingCard, // optional - only passed inside a Library card (see useDragSafeFieldHooks)
}) => {
  const { value, changeValue, commit, handleKeyDown } = useMonsterFieldHooks({ cardId, fieldKey });
  const { editRef, readOnly, beginEdit, endEdit } = useDragSafeFieldHooks({ setEditingCard });
  const id = `monster-field-${cardId}-${fieldKey}`;

  useEffect(() => {
    onValueChange?.(value);
  }, [value]);

  return (
    <div className={'monster-field' + (icon ? ' monster-field-icon-row' : '') + (className ? ' ' + className : '')}>
      <label className={'monster-field-label' + (hideLabel || icon ? ' sr-only' : '')} htmlFor={id}>{label}</label>
      {icon && (
        <span className='monster-field-icon-label' aria-hidden='true'>
          <img className='monster-field-icon' src={icon} alt='' />
          <span className='tooltip'>{label}</span>
        </span>
      )}
      {multiline ? (
        <textarea
          id={id}
          ref={editRef}
          className='monster-field-textarea'
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
          onClick={beginEdit}
          onFocus={beginEdit}
          onChange={(e) => changeValue(e.target.value)}
          onBlur={() => { commit(); endEdit(); }}
          onKeyDown={handleKeyDown}
          // Only needed on the canvas, to stop a scroll-to-zoom gesture over
          // the field from also zooming the canvas - in a Library card
          // there's no canvas underneath, and it would stop the library
          // list itself from scrolling with the pointer over a textarea.
          onWheel={setEditingCard ? undefined : (e) => e.stopPropagation()}
        />
      ) : (
        <input
          id={id}
          ref={editRef}
          type='text'
          className='monster-field-input'
          inputMode={numeric ? 'numeric' : undefined}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
          onClick={beginEdit}
          onFocus={beginEdit}
          onChange={(e) => changeValue(e.target.value)}
          onBlur={() => { commit(); endEdit(); }}
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
};

export default MonsterTextField;
