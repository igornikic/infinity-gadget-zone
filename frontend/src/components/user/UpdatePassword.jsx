import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import {
  clearErrors,
  updatePassword,
  updatePasswordReset,
} from "../../features/user/userSlice";

import { EyeIcon, EyeSlashIcon, PasswordIcon } from "../../icons/FormIcons";
import "./user.css";

const UpdatePassword = () => {
  const dispatch = useDispatch();

  // Extract auth and user state from redux store
  const { error, isUpdated, loading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  // Destructure the form data for easier access
  const { oldPassword, password, confirmPassword } = formData;

  // Update the formData state whenever an input field changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Toggle visibility of the password input field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dispatche updatePassword action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePassword(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Update Password" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful password changing */}
      {isUpdated && (
        <Alert
          message={"Password Changed Successfully!"}
          type={"success"}
          clear={updatePasswordReset}
        />
      )}

      <div className="background-authentication">
        <div className="form-style update-password-form">
          <form onSubmit={onSubmit}>
            <h1>Update Password</h1>
            <div>
              {/* Username input field */}
              <label htmlFor="update-password-username">Username</label>
              <input
                type="text"
                id="update-password-username"
                name="username"
                value={user.username}
                autoComplete="username"
                disabled
              />
            </div>
            <div>
              {/* Old password input field */}
              <label htmlFor="update-password-old">Old Password</label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="update-password-old"
                  name="oldPassword"
                  value={oldPassword}
                  placeholder="Old password"
                  onChange={onChange}
                  autoComplete="current-password"
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
              {/* New password input field */}
              <label htmlFor="update-password-new">New Password</label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="update-password-new"
                  name="password"
                  value={password}
                  placeholder="New Password"
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
              {/* Confirm new password input field */}
              <label htmlFor="update-password-confirm">
                Confirm New Password
              </label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="update-password-confirm"
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
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
