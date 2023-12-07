import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";

import { clearErrors, login } from "../../features/user/authSlice";

import {
  EmailIcon,
  EyeIcon,
  EyeSlashIcon,
  PasswordIcon,
} from "../../icons/FormIcons";
import "../Form.css";

const Login = () => {
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
    email: "",
    password: "",
  });

  // Destructure the form data for easier access
  const { email, password } = formData;

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
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Toggle visibility of the password input field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dispatch login action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Login" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful login */}
      {isAuthenticated && (
        <Alert message={"Logged Successfully!"} type={"success"} />
      )}

      <div className="background-authentication">
        <div className="form-style login-form">
          <form onSubmit={onSubmit}>
            <h1>Login</h1>
            <div>
              {/* Email input field */}
              <label htmlFor="login-email">Email</label>
              <EmailIcon />
              <input
                type="email"
                id="login-email"
                name="email"
                value={email}
                placeholder="Email"
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>
            <div>
              {/* Password input field */}
              <label htmlFor="login-password">Password</label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  value={password}
                  placeholder="Password"
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
              {/* Forgot password link */}
              <Link to="/password/forgot" id="forgot-password">
                Forgot Password?
              </Link>
            </div>
            {/* Submit button */}
            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
