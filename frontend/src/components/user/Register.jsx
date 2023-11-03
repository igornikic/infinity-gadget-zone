import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import { clearErrors, register } from "../../features/user/authSlice";

import { DefaultAvatarEncoded } from "../../assets/defaultAvatarEncoded";
import {
  EmailIcon,
  EyeIcon,
  EyeSlashIcon,
  PasswordIcon,
  UploadFileIcon,
  UserIcon,
} from "../../icons/FormIcons";
import "./user.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract auth state from redux store
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Base64-encoded string of DefaultAvatar
    avatar: DefaultAvatarEncoded,
  });

  // Destructure the form data for easier access
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    avatar,
  } = formData;

  // Navigate user to "/" on successfull authentication
  useEffect(() => {
    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated]);

  // Update the formData state whenever an input field changes
  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const files = Array.from(e.target.files);
      const reader = new FileReader();
      // Update the image state to the base64 data URL provided by FileReader
      reader.onload = () => {
        setFormData({
          ...formData,
          [e.target.name]: reader.result,
        });
      };
      reader.readAsDataURL(files[0]);
    } else {
      // Update other form data fields
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Toggle visibility of the password input field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dispatche register action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Register" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful registration */}
      {isAuthenticated && (
        <Alert message={"Registered Successfully!"} type={"success"} />
      )}

      <div className="background-authentication">
        <div className="form-style register-form">
          <form onSubmit={onSubmit} encType="multipart/form-data">
            <h1>Create Your Account</h1>
            <div>
              {/* Username input field */}
              <label htmlFor="register-username">Username</label>
              <UserIcon />
              <input
                type="text"
                id="register-username"
                name="username"
                value={username}
                placeholder="Username"
                onChange={onChange}
                autoComplete="username"
                required
              />
            </div>
            <div className="inline-flex">
              <div>
                {/* First name input field */}
                <label htmlFor="register-first-name">First Name</label>
                <input
                  type="text"
                  id="register-first-name"
                  name="firstName"
                  value={firstName}
                  placeholder="First name"
                  onChange={onChange}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                {/* Last name input field */}
                <label htmlFor="register-last-name">Last Name</label>
                <input
                  type="text"
                  id="register-last-name"
                  name="lastName"
                  value={lastName}
                  placeholder="Last name"
                  onChange={onChange}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
            <div>
              {/* Email input field */}
              <label htmlFor="register-email">Email</label>
              <EmailIcon />
              <input
                type="email"
                id="register-email"
                name="email"
                value={email}
                placeholder="Email"
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>
            <div className="inline-flex">
              <div>
                {/* Password input field */}
                <label htmlFor="register-password">Password</label>
                <span className="password-input">
                  <PasswordIcon />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    name="password"
                    value={password}
                    placeholder="Password"
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
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <span className="password-input">
                  <PasswordIcon />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-confirm-password"
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
            </div>
            <div>
              {/* Avatar inut field */}
              <label htmlFor="register-avatar">Avatar</label>
              <div className="avatar-wrapper">
                <div>
                  {/* Render the user's avatar image if uploaded, otherwise use the default avatar */}
                  <img
                    src={avatar}
                    className="rounded-circle"
                    width="96"
                    height="96"
                    alt="Avatar Image"
                  />
                </div>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="register-avatar"
                    name="avatar"
                    className="input-upload"
                    accept="images/*"
                    onChange={onChange}
                  />
                  <UploadFileIcon />
                </div>
              </div>
            </div>
            {/* Submit button */}
            <button type="submit" className="submit-button">
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
