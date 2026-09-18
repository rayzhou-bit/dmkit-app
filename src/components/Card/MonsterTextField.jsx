import React, { useEffect } from 'react';

import { useMonsterFieldHooks } from './hooks';

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
  onValueChange, // optional - notified of the local (uncommitted) value live, e.g. for the ability modifier
}) => {
  const { value, changeValue, commit, handleKeyDown } = useMonsterFieldHooks({ cardId, fieldKey });
  const id = `monster-field-${cardId}-${fieldKey}`;

  useEffect(() => {
    onValueChange?.(value);
  }, [value]);

  return (
    <div className={'monster-field' + (className ? ' ' + className : '')}>
      <label className={'monster-field-label' + (hideLabel ? ' sr-only' : '')} htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          className='monster-field-textarea'
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => changeValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          onWheel={(e) => e.stopPropagation()}
        />
      ) : (
        <input
          id={id}
          type='text'
          className='monster-field-input'
          inputMode={numeric ? 'numeric' : undefined}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => changeValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
};

export default MonsterTextField;
