import React from 'react';
import { VIEW_OPTIONS } from './hooks';

import './index.scss';
import EnabledCondenseIcon from '../../assets/icons/condense-enabled.svg';
import DisabledCondenseIcon from '../../assets/icons/condense-disabled.svg';
import EnabledExpandIcon from '../../assets/icons/expand-enabled.svg';
import DisabledExpandIcon from '../../assets/icons/expand-disabled.svg';

const ViewBar = ({
  viewOption,
  setViewOption,
}) => {

  return (
    <div className='option-row'>
      <div className='horizontal-bar' />
      <button
        className='option'
        onClick={() => setViewOption(VIEW_OPTIONS.condensed)}
      >
        <img src={viewOption === VIEW_OPTIONS.condensed ? DisabledCondenseIcon : EnabledCondenseIcon} />
      </button>
      <button
        className='option'
        onClick={() => setViewOption(VIEW_OPTIONS.expanded)}
      >
        <img src={viewOption === VIEW_OPTIONS.expanded ? DisabledExpandIcon : EnabledExpandIcon} />
      </button>
    </div>
  );
};

export default ViewBar;