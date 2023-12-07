import React from "react";
import { Link } from "react-router-dom";

import { PartnerIcon } from "../../icons/PaymentIcons";

import "./Home.css";

const Home = () => {
  return (
    <div>
      <div className="partner-link">
        {/* Become a partner link */}
        <Link to="/shop/login">
          <button className="partner-button">
            <pre>
              <PartnerIcon /> Become a Partner
            </pre>
          </button>
        </Link>
      </div>
      Home
    </div>
  );
};

export default Home;
