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
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const activeViewId = campaignColl[campaignId] ? campaignColl[campaignId].activeViewId : null;

  // IDS & REFS
  const searchId = "library-search-input";
  const searchRef = useRef(searchId);

  const addToCardList = (cardList, cardId) => {
    return cardList = [
      ...cardList,
      <LibraryCard key={cardId} cardId={cardId} cardData={cardColl[cardId]} />,
    ];
  };

  // CARD LIST
  let cardList = [];
  if (cardColl) {
    for (let cardId in cardColl) {
      let cardContainsSearchString = false;
      if (cardColl[cardId].content) {
        const cardTitle = cardColl[cardId].title ? cardColl[cardId].title : "";
        const cardText = cardColl[cardId].content.text ? cardColl[cardId].content.text : "";
        if (cardTitle.toLowerCase().includes(enteredSearch.toLowerCase()) ||
          cardText.toLowerCase().includes(enteredSearch.toLocaleLowerCase())) {
          cardContainsSearchString = true;
        }
      }
      let cardIsInActiveView = cardColl[cardId].views && cardColl[cardId].views[activeViewId];
      let cardIsUnused = Object.keys(cardColl[cardId].views).length === 0;

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
        <input id={searchId} ref={searchRef}
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