import React from 'react';

import FilterBar from './FilterBar';
import SortBar from './SortBar';
import LibraryCard from '../Card/LibraryCard';
import LibrarySearch from './LibrarySearch';

import { useLibraryHooks } from './hooks';

import './index.scss';
import LibraryIcon from '../../assets/icons/library.svg';

const Library = () => {
  const {
    isOpen,
    toggleLibrary,
    setSearchString,
    filterOption,
    setFilterOption,
    filterColor,
    setFilterColor,
    sortOption,
    setSortOption,
    viewOption,
    setViewOption,
    libraryCards,
  } = useLibraryHooks();

  const cardComponents = libraryCards.map(id => <LibraryCard key={id} cardId={id} />);

  return (
    <div className={`library ${isOpen ? 'open': 'close'}`}>
      <div className='library-panel'>
        {/* 
          TODO remove LibrarySearch and expand out its functionality to the following.
            Make changes to the hooks file to change filtering and sorting
            Change names of components if need be
        */}
        {/* <SearchBar setSearchString={setSearchString} /> */}
        <FilterBar
          filterOption={filterOption} setFilterOption={setFilterOption}
          filterColor={filterColor} setFilterColor={setFilterColor}
        />
        <SortBar sortOption={sortOption} setSortOption={setSortOption} />
        {/* <ViewBar viewOption={viewOption} setViewOption={setViewOption} /> */}
        <div className='library-card-container'>
          {cardComponents}
        </div>

        <LibrarySearch />
      </div>
      <button className='library-btn' onClick={toggleLibrary}>
        <img src={LibraryIcon} alt='Library' />
        <span className='tooltip'>Library</span>
      </button>
    </div>
  );
};

export default Library;
