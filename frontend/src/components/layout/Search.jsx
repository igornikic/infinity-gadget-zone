import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchIcon } from "../../icons/NavIcons";
import "./Search.css";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  // Navigate to search page with keyword appended to URL path
  const searchHandler = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate("/");
    }
  };

  return (
    <form className="search-form" onSubmit={searchHandler}>
      <div className="search">
        {/* Search input field */}
        <input
          type="search"
          id="search"
          name="search"
          placeholder="Search..."
          autoComplete="on"
          onChange={(e) => setKeyword(e.target.value)}
        />
        {/* Submit button */}
        <button type="submit" aria-label="Search" className="search-button">
          <SearchIcon />
        </button>
      </div>
    </form>
  );
};

export default Search;
