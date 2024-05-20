import React from 'react';

import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import SortBar from './SortBar';
import ViewBar from './ViewBar';
import LibraryCard from '../Card/LibraryCard';

import { VIEW_OPTIONS, useLibraryHooks } from './hooks';

import './index.scss';
import ClosedLibraryIcon from '../../assets/icons/library-closed.svg';
import OpenLibraryIcon from '../../assets/icons/library-open.svg';

const Library = () => {
  const {
    isOpen,
    toggleLibrary,
    countDisplay,
    searchString,
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
        <SearchBar
          countDisplay={countDisplay}
          searchString={searchString}
          setSearchString={setSearchString}
        />
        <FilterBar
          isColorFiltered={isColorFiltered}
          setIsColorFiltered={setIsColorFiltered}
          filterColorOption={filterColorOption}
          setFilterColorOption={setFilterColorOption}
          filterTabOption={filterTabOption}
          setFilterTabOption={setFilterTabOption}
        />
        <SortBar
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        <ViewBar
          viewOption={viewOption}
          setViewOption={setViewOption}
        />
        <div className='library-card-container'>
          {cardComponents}
        </div>
      </div>
      <button className='library-btn' onClick={toggleLibrary}>
        <img src={isOpen ? OpenLibraryIcon : ClosedLibraryIcon} alt='Library' />
        <span className='tooltip'>Library of cards</span>
      </button>
    </div>
  );
};

export default Library;
