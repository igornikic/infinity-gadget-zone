import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import { activateShop, clearErrors } from "../../features/shop/shopAuthSlice";

import Background from "../layout/Background";
import SuccessAnimation from "../layout/SuccessAnimation";
import ErrorAnimation from "../layout/ErrorAnimation";

import "./ActivateShop.css";
import "../layout/PrimaryBtn.css";

const ActivateShop = () => {
  const dispatch = useDispatch();
  const { token } = useParams();

  // Extract shopAuth state from redux store
  const { loading, error, isSeller } = useSelector((state) => state.shopAuth);

  // State for displaying error message
  const [isActive, setIsActicve] = useState(!error);

  // Dispatch activateShop action to the Redux store on page load
  useEffect(() => {
    dispatch(activateShop(token));
  }, []);

  // If there is an error, set 'isActive' to false
  useEffect(() => {
    if (error) {
      setIsActicve(false);
    }
  }, [error]);

  return (
    <>
      {/* Page title */}
      <PageTitle title="Activate Shop" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful shop activation */}
      {isSeller && (
        <Alert
          message={"Successfull activation. Happy selling!"}
          type={"success"}
        />
      )}

      <div className="activation-container">
        {/* Background animation */}
        <Background />

        {/* Display success activation message on success */}
        {isSeller && (
          <>
            <h1>Shop Activation Successful!</h1>
            <SuccessAnimation />
            <Link to="/shop/me">
              <button type="submit" className="primary-btn">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                View Store
              </button>
            </Link>
          </>
        )}

        {/* Display error activation message on error */}
        {!isActive && (
          <>
            <h1>Shop Activation Failed!</h1>
            <ErrorAnimation />
            <Link to="/">
              <button type="submit" className="primary-btn">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Home
              </button>
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default ActivateShop;
