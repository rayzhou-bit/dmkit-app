import React, { useState } from "react";

import './LibrarySearch.scss';
import SearchImg from '../../assets/icons/search.png';

const SearchBar = ( setSearchString ) => {
    const [enteredSearch, setEnteredSearch] = useState('');

    return(
        <div className="new-library-search-bar-container">   
            <div className="search-bar">    
                <img src={SearchImg} alt="Search" />
                <input className="search-input"
                type="search" placeholder="Search Library"
                value={enteredSearch} onChange={e => setEnteredSearch(e.target.value)}
                />
                {/* <div className="search-count">
                {(cardList.length) + "/" + (cardCollection ? Object.keys(cardCollection).length : "")}
                </div> */}
            </div>
        </div>
    )
};

export default SearchBar;