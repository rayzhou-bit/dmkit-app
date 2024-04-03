import React from 'react';

import { useTitleHooks } from './hooks';

import './index.scss';

const Title = () => {
  const {
    inputClassName,
    readOnly,
    titleRef,
    titleValue,
    changeTitleValue,
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
  } = useTitleHooks();

  return (
    <div className='usermenu-title'>
      <input
        className={inputClassName}
        maxLength='300'
        onBlur={endTitleEdit}
        onChange={e => changeTitleValue(e.target.value)}
        onDoubleClick={beginTitleEdit}
        onDragOver={e => e.preventDefault()}
        onKeyDown={handleTitleKeyPress}
        readOnly={readOnly}
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