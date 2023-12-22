import React from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { useTitleHooks } from './hooks';

import './index.scss';

const Title = () => {
  const dispatch = useDispatch();

  const {
    inputClassName,
    readOnly,
    titleRef,
    titleValue,
    changeTitleValue,
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
  } = useTitleHooks({
    saveNewValue: (value) => dispatch(actions.updCampaignTitle(value)),
  });

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