import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import './LibrarySearch.scss';
import LibraryCard from './LibraryCard/LibraryCard';

import SearchImg from '../../../assets/icons/search2.png';

const LibrarySearch = props => {
  // STATES
  const [enteredSearch, setEnteredSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('current'); // all, current, unused

  // STORE SELECTORS
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardCollection = useSelector(state => state.campaignData.cards);

  // IDS & REFS
  const searchRef = useRef("library-search-input");

  // FUNCTIONS
  const addToCardList = (cardList, cardId) => {
    return cardList = [
      ...cardList,
      <LibraryCard key={cardId} cardId={cardId} />,
    ];
  };

  // DISPLAY ELEMENTS
  let cardList = [];
  if (cardCollection) {
    for (let cardId in cardCollection) {
      let cardContainsSearchString = false;
      if (cardCollection[cardId].content) {
        const cardTitle = cardCollection[cardId].title ? cardCollection[cardId].title : "";
        const cardText = cardCollection[cardId].content.text ? cardCollection[cardId].content.text : "";
        if (cardTitle.toLowerCase().includes(enteredSearch.toLowerCase()) ||
          cardText.toLowerCase().includes(enteredSearch.toLocaleLowerCase())) {
          cardContainsSearchString = true;
        }
      }
      let cardIsInActiveView = cardCollection[cardId].views && cardCollection[cardId].views[activeViewId];
      let cardIsUnused = Object.keys(cardCollection[cardId].views).length === 0;

      switch (searchFilter) {
        case 'all':
          if (cardContainsSearchString) {
            cardList = addToCardList(cardList, cardId);
          }
          break;
        case 'current':
          if (cardContainsSearchString && cardIsInActiveView) {
            cardList = addToCardList(cardList, cardId);
          }
          break;
        case 'unused':
          if (cardContainsSearchString && cardIsUnused) {
            cardList = addToCardList(cardList, cardId);
          }
          break;
        default: break;
      }
    };
  }

  return (
    <>
      <div id="library-search-bar-container">
        <img src={SearchImg} alt="Search" />
        <input id="library-search-input" ref={searchRef}
          type="search" placeholder="Search..."
          value={enteredSearch} onChange={e => setEnteredSearch(e.target.value)}
        />
      </div>
      <div id="library-search-types">
        <div style={searchFilter==='all' ? {borderBottom: "3px solid black", backgroundColor: "#ededed"} : null} 
          onClick={() => setSearchFilter('all')}>All cards</div>
        <div style={searchFilter==='current' ? {borderBottom: "3px solid black", backgroundColor: "#ededed"} : null}
          onClick={() => setSearchFilter('current')}>Current view</div>
        <div style={searchFilter==='unused' ? {borderBottom: "3px solid black", backgroundColor: "#ededed"} : null} 
          onClick={() => setSearchFilter('unused')}>Unused cards</div>
      </div>
      <div id="library-search-results-container">
        {cardList}
      </div>
    </>
  );
};

export default LibrarySearch;