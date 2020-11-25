import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import './Library.scss';
import * as actions from '../../store/actionIndex';
import LibCard from './LibCard/LibCard';

import LibraryButton from '../../media/icons/book.svg';

const Library = React.memo(props => {
  // VARIABLES
  const [showLibrary, setShowLibrary] = useState(false);
  const cardColl = useSelector(state => state.card);
  const [enteredSearch, setEnteredSearch] = useState('');
  const searchRef = useRef();

  // CARD LIST
  let cardList = [];
  if (cardColl) {
    for (let cardId in cardColl) {
      if (cardColl[cardId].data) {
        const cardTitle = cardColl[cardId].data.title ? cardColl[cardId].data.title : "";
        const cardText = cardColl[cardId].data.text ? cardColl[cardId].data.text : "";
        if (cardTitle.toLowerCase().includes(enteredSearch.toLowerCase()) ||
          cardText.toLowerCase().includes(enteredSearch.toLocaleLowerCase())) {
          cardList = [
            ...cardList,
            <LibCard key={cardId} cardIndex={cardId} />
          ];
        }
      }
    }
  }

  // STYLES
  let showLibStyle = {
    width: showLibrary ? '800px' :'0px',
  };

  return (
    <div id="library">
      <div id="btnContainer">
        <input id="showLibButton" type="image" src={LibraryButton} alt="Library"
          onClick={() => setShowLibrary(!showLibrary)} />
      </div>
      <div id="libPanel" style={showLibStyle}>
        <div id="libSearchBar">
          <label>Search Library: </label>
          <input
            ref={searchRef}
            type="text"
            value={enteredSearch}
            onChange={event => setEnteredSearch(event.target.value)}
          />
        </div>
        {cardList}
      </div>
    </div>
  );
});

export default Library;