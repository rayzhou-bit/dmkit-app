import React from 'react';

import { useMonsterFieldHooks } from './hooks';

import './Card.scss';

const MonsterTextField = ({
  cardId,
  fieldKey,
  label,
  placeholder,
  maxLength,
  multiline,
  numeric,
  className,
}) => {
  const { value, changeValue, commit, handleKeyDown } = useMonsterFieldHooks({ cardId, fieldKey });

  return (
    <label className={'monster-field' + (className ? ' ' + className : '')}>
      <span className='monster-field-label'>{label}</span>
      {multiline ? (
        <textarea
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
    </label>
  );
};

export default MonsterTextField;
