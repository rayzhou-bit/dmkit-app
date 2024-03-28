import { useState } from "react";

const SearchBar = ( setSearchString ) => {
    const [enteredSearch, setEnteredSearch] = useState('');

    return(
        <>        
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
        </>
    )
}

export default SearchBar;