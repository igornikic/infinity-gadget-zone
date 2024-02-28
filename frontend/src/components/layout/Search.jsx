import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import VoiceSearch from "./VoiceSearch";
import { SearchIcon } from "../../icons/NavIcons";
import "./Search.css";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for search keyword
  const [keyword, setKeyword] = useState("");
  const formRef = useRef(null);

  const searchHandler = (e) => {
    e.preventDefault();

    // Check if keyword is not empty
    if (keyword.trim()) {
      let currentURL = location.pathname;

      if (currentURL.includes("/products/shop")) {
        // Navigate to /products/shop/id/keyword
        currentURL = constructURLWithKeyword(keyword);
      } else {
        // Navigate to /search/keyword
        currentURL = `/search/${encodeURIComponent(keyword)}`;
      }
      navigate(currentURL);
    }
  };

  const handleTranscriptChange = (transcript) => {
    // Check if form reference exists and the transcript is not empty
    if (formRef.current && transcript.trim()) {
      setKeyword(transcript);
      let currentURL = location.pathname;

      if (currentURL.includes("/products/shop")) {
        // Navigate to /products/shop/id/keyword
        currentURL = constructURLWithKeyword(transcript);
      } else {
        // Navigate to /search/${transcript}
        currentURL = `/search/${encodeURIComponent(transcript)}`;
      }
      navigate(currentURL);
    }
  };

  const constructURLWithKeyword = (keywordValue) => {
    const urlParts = location.pathname.split("/");
    // Url is /products/shop/id/keyword where keyword is always at 4th index
    urlParts[4] = encodeURIComponent(keywordValue);
    return urlParts.join("/");
  };

  return (
    <form className="search-form" onSubmit={searchHandler} ref={formRef}>
      <div className="search">
        {/* Search input */}
        <input
          type="search"
          id="search-string"
          name="search-string"
          value={keyword}
          placeholder="Search..."
          autoComplete="on"
          onChange={(e) => setKeyword(e.target.value)}
        />
        {/* Search button */}
        <button
          type="submit"
          name="Search"
          aria-label="Search"
          className="search-button"
        >
          <div>
            <SearchIcon />
          </div>
        </button>
        {/* Voice search button */}
        <button
          type="button"
          name="voice-search"
          aria-label="voice-search"
          className="voice-search-button"
        >
          <VoiceSearch onTranscriptChange={handleTranscriptChange} />
        </button>
      </div>
    </form>
  );
};

export default Search;
