import { useState } from "react";

import SearchImg from '../../assets/icons/search.png';

const SearchBar = ( setSearchString ) => {
    const [enteredSearch, setEnteredSearch] = useState('');

    return(
        <>   
            <div className="search-bar">
                     
                <img src={SearchImg} alt="Search" />
                <input className="search-input"
                type="search" placeholder="Search..."
                value={enteredSearch} onChange={e => setEnteredSearch(e.target.value)}
                />
                {/* <div className="search-count">
                {(cardList.length) + "/" + (cardCollection ? Object.keys(cardCollection).length : "")}
                </div> */}
            </div>
        </>
    )
};

export default SearchBar;