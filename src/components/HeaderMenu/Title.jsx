import React from 'react';

import { useTitleHooks } from './hooks';

import './index.scss';

const Title = () => {
  const {
    titleRef,
    titleValue,
    changeTitleValue,
    endTitleEdit,
    handleTitleKeyPress,
  } = useTitleHooks();

  return (
    <div className='usermenu-title'>
      <input
        maxLength='300'
        onBlur={endTitleEdit}
        onChange={e => changeTitleValue(e.target.value)}
        onDragOver={e => e.preventDefault()}
        onKeyDown={handleTitleKeyPress}
        ref={titleRef}
        required
        size=''
        title={titleValue}
        type='text'
        value={titleValue ?? ''}
      />
    </div>
  );
};

export default Title;