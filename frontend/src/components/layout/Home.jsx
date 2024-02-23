import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// import Table from "./Table.jsx";
// import tableData from "../product/data.json";

import { PartnerIcon } from "../../icons/PaymentIcons";

import "./Home.css";

const Home = () => {
  const { isSeller } = useSelector((state) => state.shopAuth);
  const { isAuthenticated } = useSelector((state) => state.auth);
  return (
    <div>
      {!isSeller && !isAuthenticated && (
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
      )}
      Home
      {/* <Table tableData={tableData} /> */}
    </div>
  );
};

export default Home;
