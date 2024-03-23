import React from 'react';

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
    setFilterOption,
    setSortOption,
    setViewOption,
    libraryCards,
  } = useLibraryHooks();

  let cardComponents = [];
  for (let id in libraryCards) {
    cardComponents = [
      ...cardComponents,
      <LibraryCard key={id} cardId={id} />,
    ];
  }

  return (
    <div className={`library ${isOpen ? 'open': 'close'}`}>
      <div className='library-panel'>
        <LibrarySearch />
        {/* 
          TODO remove LibrarySearch and expand out its functionality to the following.
            Make changes to the hooks file to change filtering and sorting
            Change names of components if need be
        */}
        {/* <SearchBar setSearchString={setSearchString} /> */}
        {/* <FilterBar setFilterOption={setFilterOption} /> */}
        {/* <SortBar setSortOption={setSortOption} /> */}
        {/* <ViewBar setViewOption={setViewOption} /> */}
        {/* <div className='library-card-container'>
          {cardComponents}
        </div> */}
      </div>
      <button className='library-btn' onClick={toggleLibrary}>
        <img src={LibraryIcon} alt='Library' />
        <span className='tooltip'>Library</span>
      </button>
    </div>
  );
};

export default Library;
