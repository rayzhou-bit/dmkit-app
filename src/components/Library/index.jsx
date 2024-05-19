import React from 'react';

import FilterBar from './FilterBar';
import SortBar from './SortBar';
import ViewBar from './ViewBar';
import LibraryCard from '../Card/LibraryCard';
import LibrarySearch from './LibrarySearch';

import { VIEW_OPTIONS, useLibraryHooks } from './hooks';

import './index.scss';
import ClosedLibraryIcon from '../../assets/icons/library-closed.svg';
import OpenLibraryIcon from '../../assets/icons/library-open.svg';

const Library = () => {
  const {
    isOpen,
    toggleLibrary,
    setSearchString,
    isColorFiltered,
    setIsColorFiltered,
    filterColorOption,
    setFilterColorOption,
    filterTabOption,
    setFilterTabOption,
    sortOption,
    setSortOption,
    viewOption,
    setViewOption,
    libraryCards,
  } = useLibraryHooks();

  const cardComponents = libraryCards.map(id =>
    <LibraryCard key={id} cardId={id} isExpanded={viewOption === VIEW_OPTIONS.expanded} />
  );

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
          isColorFiltered={isColorFiltered} setIsColorFiltered={setIsColorFiltered}
          filterColorOption={filterColorOption} setFilterColorOption={setFilterColorOption}
          filterTabOption={filterTabOption} setFilterTabOption={setFilterTabOption}
        />
        <SortBar sortOption={sortOption} setSortOption={setSortOption} />
        <ViewBar viewOption={viewOption} setViewOption={setViewOption} />
        <div className='library-card-container'>
          {cardComponents}
        </div>

        {/* <LibrarySearch /> */}
      </div>
      <button className='library-btn' onClick={toggleLibrary}>
        <img src={isOpen ? OpenLibraryIcon : ClosedLibraryIcon} alt='Library' />
        <span className='tooltip'>Library of cards</span>
      </button>
    </div>
  );
};

export default Library;
