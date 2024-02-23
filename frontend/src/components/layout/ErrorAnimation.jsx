import React from "react";

import "./ErrorAnimation.css";

const ErrorAnimation = () => {
  return (
    <div className="error-container">
      <div className="error-circle-border"></div>
      <div className="error-circle">
        <div className="error"></div>
      </div>
    </div>
  );
};

export default ErrorAnimation;
