import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { ErrorIcon, SuccessIcon } from "../../icons/AlertIcons";
import "./Alert.css";

const Alert = ({ message, clear, type }) => {
  const dispatch = useDispatch();
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    let timeout;

    // Clear alert message
    const clearAlert = () => {
      setAlertMessage("");
      if (clear) {
        dispatch(clear());
      }
    };

    if (message) {
      setAlertMessage(message);

      // Set a timeout to clear alert message after 5 seconds
      timeout = setTimeout(clearAlert, 5000);
    }

    // Clean up timeout when component unmounts or when alert message changes
    return () => {
      clearTimeout(timeout);
    };
  }, [message, clear, dispatch]);

  return alertMessage ? (
    <div className={`alert show alert-${type}`} role="alert">
      {type === "error" ? <ErrorIcon /> : <SuccessIcon />}
      <h3>
        <pre>{alertMessage}</pre>
      </h3>
    </div>
  ) : null;
};

export default Alert;
