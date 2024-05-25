import React from 'react';

import './index.scss';

const SearchBar = ({
  countDisplay,
  searchString,
  setSearchString,
}) => {
  return (
    <div className='search-row'>
      <img className='search-img' />
      <input
        className='search-input'
        onChange={e => setSearchString(e.target.value)}
        placeholder='Search Library'
        type='search'
        value={searchString}
      />
      <div className={`search-count ${!searchString ? 'shift-right' : ''}`}>
        {countDisplay}
      </div>
      <img
        className='search-clear'
        onClick={() => setSearchString('')}
        style={{ display: searchString ? 'block' : 'none' }}
      />
    </div>
  );
};

export default SearchBar;