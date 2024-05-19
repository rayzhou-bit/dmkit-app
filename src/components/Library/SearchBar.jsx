import React from 'react';

import './index.scss';

const SearchBar = ({
  searchString,
  setSearchString,
  countDisplay,
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
      <div className='search-count'>
        {countDisplay}
      </div>
      <img
        className='search-clear'
        onClick={() => setSearchString('')}
      />
    </div>
  );
};

export default SearchBar;