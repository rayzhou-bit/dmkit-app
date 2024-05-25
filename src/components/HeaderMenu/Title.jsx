import React from 'react';

import { useTitleHooks } from './hooks';

import './index.scss';

const Title = () => {
  const {
    title,
    onChange,
    startEdit,
    endEdit,
    handleKeyPress,
  } = useTitleHooks();

  return (
    <div className='usermenu-title'>
      <input
        maxLength='300'
        onBlur={endEdit}
        onClick={startEdit}
        onChange={event => onChange(event.target.value)}
        onDragOver={event => event.preventDefault()}
        onKeyDown={handleKeyPress}
        required
        spellCheck={false}
        title={title}
        type='text'
        value={title}
      />
    </div>
  );
};

export default Title;