import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./CookieConsent.css";

const CookieConsent = () => {
  // State to track user's choice
  const [userMadeChoice, setUserMadeChoice] = useState(
    localStorage.getItem("cookieConsent") !== null
  );

  // Function to handle accepting all cookies
  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "true");
    setUserMadeChoice(true);
  };

  // Function to handle accepting only essential cookies
  const handleEssential = () => {
    localStorage.setItem("cookieConsent", "false");

    // Expire cookies that are non essential here

    setUserMadeChoice(true);
  };

  // Render cookie consent banner if user hasn't made a choice yet
  return !userMadeChoice ? (
    <div className={`cookie-consent`}>
      <h4>🍪 Cookie Notice</h4>
      <p>
        We use cookies to ensure that we give you the best experience on our
        website.
      </p>{" "}
      <Link to="#">Read cookies policies</Link>
      <br />
      <button onClick={handleAcceptAll}>Accept All</button>
      <button onClick={handleEssential}>Essential</button>
    </div>
  ) : null;
};

export default CookieConsent;
