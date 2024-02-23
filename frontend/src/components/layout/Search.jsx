import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import VoiceSearch from "./VoiceSearch";
import { SearchIcon } from "../../icons/NavIcons";
import "./Search.css";

const Search = () => {
  const navigate = useNavigate();

  // State for search keyword
  const [keyword, setKeyword] = useState("");
  const formRef = useRef(null);

  const searchHandler = (e) => {
    e.preventDefault();

    // Check if keyword is not empty
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    }
  };

  const handleTranscriptChange = (transcript) => {
    // Check if form reference exists and the transcript is not empty
    if (formRef.current && transcript.trim()) {
      setKeyword(transcript);
      navigate(`/search/${transcript}`);
    }
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
