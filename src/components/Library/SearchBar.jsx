import './LibrarySearch.scss';
import SearchImg from '../../assets/icons/search.png';

const SearchBar = ( {searchString, setSearchString, libraryCards }) => {
    return(
        <div className="new-library-search-bar-container">   
            <div className="search-bar">    
                <img src={SearchImg} alt="Search" />
                <input className="search-input"
                type="search" placeholder="Search Library"
                value={searchString} onChange={e => setSearchString(e.target.value)}
                />
                <div className="search-count">
                {(libraryCards.active.length) + "/" + (libraryCards.all)}
                </div>
            </div>
        </div>
    )
};

export default SearchBar;