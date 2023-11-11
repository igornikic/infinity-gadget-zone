import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import {
  clearErrors,
  clearMessage,
  resetPassword,
} from "../../features/user/forgotPasswordSlice";

import { EyeIcon, EyeSlashIcon, PasswordIcon } from "../../icons/FormIcons";
import "./user.css";

const NewPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reset password token
  const { token } = useParams();

  // Extract forgotPassword state from redux store
  const { email, loading, error, success } = useSelector(
    (state) => state.forgotPassword
  );

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Destructure the form data for easier access
  const { password, confirmPassword } = formData;

  // Navigate user to "/login" on successfull password change
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  // Update the formData state whenever an input field changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Toggle visibility of the password input field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dispatche resetPassword action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(
      resetPassword({
        token: token,
        passwords: { password, confirmPassword },
      })
    );
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="New Password" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful password setting */}
      {success && (
        <Alert
          message={"New Password Set Successfully"}
          clear={clearMessage}
          type={"success"}
        />
      )}

      <div className="background-authentication">
        <div className="form-style new-password-form">
          <form onSubmit={onSubmit}>
            <h1>New Password</h1>
            <div>
              {/* Email input field */}
              <label htmlFor="reset-password-email">Email</label>
              <input
                type="email"
                id="reset-password-email"
                name="email"
                value={email}
                autoComplete="email"
                disabled
              />
            </div>
            <div>
              {/* New password input field */}
              <label htmlFor="reset-password-new">New Password</label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="reset-password-new"
                  name="password"
                  value={password}
                  placeholder="New password"
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                />
                {/* Toggle password visibility */}
                {showPassword ? (
                  <EyeIcon onClick={togglePasswordVisibility} />
                ) : (
                  <EyeSlashIcon onClick={togglePasswordVisibility} />
                )}
              </span>
            </div>
            <div>
              {/* Confirm password input field */}
              <label htmlFor="reset-password-confirm">
                Confirm New Password
              </label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="reset-password-confirm"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="Confirm password"
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                />
                {/* Toggle password visibility */}
                {showPassword ? (
                  <EyeIcon onClick={togglePasswordVisibility} />
                ) : (
                  <EyeSlashIcon onClick={togglePasswordVisibility} />
                )}
              </span>
            </div>
            {/* Submit button */}
            <button type="submit" className="submit-button">
              Set Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewPassword;
