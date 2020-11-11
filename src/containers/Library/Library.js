import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import './Library.scss';
import * as actions from '../../store/actionIndex';
import PreviewCard from './PreviewCard/PreviewCard';

const Library = React.memo(props => {
  const showLibrary = props.show;
  const cardColl = useSelector(state => state.card);

  const [enteredSearch, setEnteredSearch] = useState('');
  const searchRef = useRef();

  let cardList = [];
  if (cardColl) {
    for (let cardIndex in cardColl) {
      const cardTitle = cardColl[cardIndex].data.title;
      const cardText = cardColl[cardIndex].data.text;
      if (cardTitle.toLowerCase().includes(enteredSearch.toLowerCase()) ||
        cardText.toLowerCase().includes(enteredSearch.toLocaleLowerCase())) {
        cardList = [
          ...cardList,
          <PreviewCard key={cardIndex} cardIndex={cardIndex} />
        ];
      }
    }
  }

  let libraryStyle = {width: '0px'};
  if (showLibrary) {
    libraryStyle = {width: '800px'};
  }

  return (
    <div id="library" style={libraryStyle}>
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
  );
});

export default Library;