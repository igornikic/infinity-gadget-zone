import React from "react";

import "./SuccessAnimation.css";

const SuccessAnimation = () => {
  return (
    <div className="success-container">
      <div className="success-animation">
        <svg
          className="success-checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            className="success-circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className="success-check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
      </div>
    </div>
  );
};

export default SuccessAnimation;
