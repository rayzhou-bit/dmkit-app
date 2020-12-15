import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import './Library.scss';
import * as actions from '../../store/actionIndex';
import LibCard from './LibCard/LibCard';

import LibBtnImg from '../../media/icons/library.png';

const Library = props => {
  // VARIABLES
  const [showLibrary, setShowLibrary] = useState(false);
  const [enteredSearch, setEnteredSearch] = useState('');

  const cardColl = useSelector(state => state.card);
  const activeView = useSelector(state => state.viewManage.activeView);

  const searchId = "libSearchBar";
  const searchRef = useRef(searchId);

  // STYLES
  const viewScreenWidth = document.getElementById('viewScreen') ? document.getElementById('viewScreen').clientWidth : 0;
  const libPanelStyle = {
    width: showLibrary ? viewScreenWidth*.35 : '0px',
    padding: showLibrary ? '0 10px 0 5px' : '0',
    borderLeft: showLibrary ? '1px solid black' : '0',
    overflowY: showLibrary ? 'scroll' : 'hidden',
  };

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
            <LibCard key={cardId} 
              cardId={cardId} cardState={cardColl[cardId]} activeView={activeView}
            />,
            <div key={cardId+'.libDivider'} className="libDivider" />
          ];
        }
      }
    }
  }

  return (
    <div id="library">
      <div id="libBtnGrid">
        <input id="showLibButton" 
          type="image" src={LibBtnImg} alt="Library"
          draggable="false"
          onClick={() => setShowLibrary(!showLibrary)} />
      </div>
      <div id="libPanelGrid" style={libPanelStyle}>
        <div id={searchId}>
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
};

export default Library;