import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import './Library.scss';
import LibCard from './LibCard/LibCard';

import LibBtnImg from '../../media/icons/library.png';
import ExpandImg from '../../media/icons/left-arrow.png';
import ShrinkImg from '../../media/icons/right-arrow.png';
import SearchImg from '../../media/icons/search2.png';

const Library = props => {
  // VARIABLES
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySize, setLibrarySize] = useState(1); // 1 is small, 2 is big
  const [enteredSearch, setEnteredSearch] = useState('');
  // const [displayedItems, setDisplayedItems] = useState('cards');

  const cardColl = useSelector(state => state.cardColl);
  const activeView = useSelector(state => state.viewManage.activeView);

  const searchId = "libSearchBar";
  const searchRef = useRef(searchId);

  // STYLES
  // const topOffset = 46;
  // const buttonHeight = 30 + 10 + 2;
  // const dividerHeight = 30 / 4;

  // const viewScreenWidth = document.getElementById('viewScreen') ? document.getElementById('viewScreen').clientWidth : 0;
  const libPanelStyle = {
    // width: showLibrary ? viewScreenWidth*(0.4*librarySize)+'px' : '0px',
    width: showLibrary ? 40*librarySize+'vw' : '0',
    padding: showLibrary ? '0 10px 0 5px' : '0',
    borderLeft: showLibrary ? '1px solid black' : '0',
    overflowY: showLibrary ? 'scroll' : 'hidden',
  };

  // CARD LIST
  let cardList = [<div key={'first.libDivider'} className="lib-divider" />];
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
            <div key={cardId+'.libDivider'} className="lib-divider" />
          ];
        }
      }
    }
  }

  return (
    <div id="library">
      <div id="libBtnGrid">
        <div className="divider" />
        <div className="button" onClick={() => setShowLibrary(!showLibrary)}>
          <img src={LibBtnImg} alt="Library" />
          <span className="tooltip" style={{right: (showLibrary) ? ((librarySize===1) ? '102%' : '101%') : '120%'}}>
            Show library
          </span>
        </div>
        <div className="divider" />
        <div className="button" style={{display: showLibrary ? 'block' : 'none'}}
          onClick={(librarySize===1) ? ()=>setLibrarySize(2) : ()=>setLibrarySize(1)}>
          <img src={(librarySize===1) ? ExpandImg : ShrinkImg} alt="Expand/Shrink" />
          <span className="tooltip" style={{right: (librarySize===1) ? '102%' : '101%'}}>
            {(librarySize==1) ? "Expand" : "Shrink"}
          </span>
        </div>
        <div className="divider" />
      </div>
      <div id="libPanelGrid" style={libPanelStyle}>
        <div id={searchId}>
          <img src={SearchImg} alt="Search" />
          <input ref={searchRef}
            type="search" placeholder="Search..."
            value={enteredSearch}
            onChange={event => setEnteredSearch(event.target.value)}
          />
          {/* <div id="cardTab">Cards</div>
          <div id="viewTab">Views</div> */}
        </div>
        <div id="libSearchResults">
          {cardList}
        </div>
      </div>
    </div>
  );
};

export default Library;