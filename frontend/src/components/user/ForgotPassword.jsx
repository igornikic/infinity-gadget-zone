import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import {
  clearErrors,
  clearMessage,
  forgotPassword,
} from "../../features/user/forgotPasswordSlice";

import { EmailIcon } from "../../icons/FormIcons";
import "./user.css";

const ForgotPassword = () => {
  const dispatch = useDispatch();

  // Extract forgotPassword state from redux store
  const { loading, message, error } = useSelector(
    (state) => state.forgotPassword
  );

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    email: "",
  });

  // Destructure the form data for easier access
  const { email } = formData;

  // Update the formData state whenever an input field changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Dispatche forgotPassword action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Forgot Password" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message if email is sent to user */}
      {message && (
        <Alert message={message} clear={clearMessage} type={"success"} />
      )}

      <div className="background-authentication">
        <div className="form-style forgot-password-form">
          <form onSubmit={onSubmit}>
            <h1>Forgot Password</h1>
            <div>
              {/* Email input field */}
              <label htmlFor="forgot-password-email">Email</label>
              <EmailIcon />
              <input
                type="email"
                id="forgot-password-email"
                name="email"
                value={email}
                placeholder="Email"
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>
            {/* Submit button */}
            <button type="submit" className="submit-button">
              Send Email
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
