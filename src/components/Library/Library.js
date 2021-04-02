import React, { useState } from 'react';

import './Library.scss';
import LibrarySearch from './LibrarySearch/LibrarySearch';

import LibBtnImg from '../../assets/icons/library.png';
import ExpandImg from '../../assets/icons/left-arrow-32.png';
import ShrinkImg from '../../assets/icons/right-arrow-32.png';

const Library = props => {
  // STATES
  const [showLibrary, setShowLibrary] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  const libraryCallbackRef = (node) => {
    if (!node) return;
    node.style.right = showLibrary ? 0 : expandedView ? "-80vw" : "-40vw"
  };

  return (
    <div className="library" ref={libraryCallbackRef}>
      <div className="library-search-container" style={{width: expandedView ? "80vw" : "40vw"}}>
        <LibrarySearch />
      </div>
      <button className="show-library library-menu-btn btn-any" onClick={() => setShowLibrary(!showLibrary)}>
        <img src={LibBtnImg} alt="Library" />
        <span className="tooltip">Show library</span>
      </button>
      <button className="expand-shrink library-menu-btn btn-any" style={{display: showLibrary ? 'block' : 'none'}}
        onClick={() => setExpandedView(!expandedView)}>
        <img src={expandedView ? ShrinkImg : ExpandImg} alt="Expand/Shrink" />
        <span className="tooltip">{expandedView ? "Shrink" : "Expand"}</span>
      </button>
    </div>
  );
};

export default Library;