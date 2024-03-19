import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import './LibrarySearch.scss';
import LibraryCard from '../Card/LibraryCard';

import SearchImg from '../../assets/icons/search2.png';

const LibrarySearch = props => {
  // STATES
  const [enteredSearch, setEnteredSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // all, current, unused

  // STORE SELECTORS
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const viewOrder = useSelector(state => state.campaignData.present.viewOrder);
  const cardCollection = useSelector(state => state.campaignData.present.cards);

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
      const cardTitle = cardCollection[cardId].title ? cardCollection[cardId].title : "";
      const cardText = cardCollection[cardId].content ? (cardCollection[cardId].content.text ? cardCollection[cardId].content.text : "") : "";
      if (cardTitle.toLowerCase().includes(enteredSearch.toLowerCase()) || cardText.toLowerCase().includes(enteredSearch.toLocaleLowerCase())) {
        const cardIsInActiveView = cardCollection[cardId].views && cardCollection[cardId].views[activeViewId];
        let cardIsUnused = true;
        for (let viewId in cardCollection[cardId].views) {
          if (viewOrder.includes(viewId)) {
            cardIsUnused = false;
            break;
          }
        }

        switch (searchFilter) {
          case 'current':
            if (cardIsInActiveView) {
              cardList = addToCardList(cardList, cardId);
            }
            break;
          case 'unused':
            if (cardIsUnused) {
              cardList = addToCardList(cardList, cardId);
            }
            break;
          default: 
            cardList = addToCardList(cardList, cardId);
            break;
        }
      }
    };
  }

  return (
    <>
      <div className="library-search-bar-container">
        <img src={SearchImg} alt="Search" />
        <div className="search-bar">
          <input className="search-input"
            type="search" placeholder="Search..."
            value={enteredSearch} onChange={e => setEnteredSearch(e.target.value)}
          />
          <div className="search-count">
            {(cardList.length) + "/" + (cardCollection ? Object.keys(cardCollection).length : "")}
          </div>
        </div>
      </div>
      <div className="library-search-types">
        <div style={searchFilter==='all' ? {borderBottom: "3px solid black", backgroundColor: "#ededed"} : null} 
          onClick={() => setSearchFilter('all')}>All cards</div>
        <div style={searchFilter==='current' ? {borderBottom: "3px solid black", backgroundColor: "#ededed"} : null}
          onClick={() => setSearchFilter('current')}>Current view</div>
        <div style={searchFilter==='unused' ? {borderBottom: "3px solid black", backgroundColor: "#ededed"} : null} 
          onClick={() => setSearchFilter('unused')}>Unused cards</div>
      </div>
      <div className="library-search-results-container">
        {cardList}
      </div>
    </>
  );
};

export default LibrarySearch;