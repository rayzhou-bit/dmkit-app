import React from 'react';
import { SORT_OPTIONS } from './hooks';

import './index.scss';

const SortBar = ({
  sortOption,
  setSortOption,
}) => {

  return (
    <div className='selection-row'>
      <div className='title'>
        <span>Sort</span>
      </div>
      <div className='selections'>
        <button
          className={`option ${sortOption === SORT_OPTIONS.abc ? 'selected' : null}`}
          onClick={() => setSortOption(SORT_OPTIONS.abc)}
        >
          <span>ABC</span>
        </button>
        <button
          className={`option ${sortOption === SORT_OPTIONS.zxy ? 'selected' : null}`}
          onClick={() => setSortOption(SORT_OPTIONS.zxy)}
        >
          <span>ZXY</span>
        </button>
        <button
          className={`option ${sortOption === SORT_OPTIONS.newest ? 'selected' : null}`}
          onClick={() => setSortOption(SORT_OPTIONS.newest)}
        >
          <span>Newest</span>
        </button>
        <button
          className={`option ${sortOption === SORT_OPTIONS.oldest ? 'selected' : null}`}
          onClick={() => setSortOption(SORT_OPTIONS.oldest)}
        >
          <span>Oldest</span>
        </button>
      </div>
    </div>
  );
};

export default SortBar;