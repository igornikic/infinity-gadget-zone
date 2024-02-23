import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Background from "../layout/Background";
import Alert from "../utils/Alert";

import { clearErrors, loginShop } from "../../features/shop/shopAuthSlice";

import {
  EmailIcon,
  PasswordIcon,
  EyeIcon,
  EyeSlashIcon,
} from "../../icons/FormIcons";

import "../Form.css";

const LoginShop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract shopAuth state from redux store
  const { loading, error, isSeller } = useSelector((state) => state.shopAuth);

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    shopEmail: "",
    password: "",
  });

  // Destructure the form data for easier access
  const { shopEmail, password } = formData;

  // Navigate seller to "/shop/me" on successfull authentication
  useEffect(() => {
    if (isSeller) {
      const timeout = setTimeout(() => {
        navigate("/shop/me");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isSeller]);

  // Update the formData state whenever an input field changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Toggle visibility of the password input field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dispatch loginShop action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginShop(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Store Login" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful shop login */}
      {isSeller && (
        <Alert
          message={"Successfully logged in. Happy selling!"}
          type={"success"}
        />
      )}

      {/* Background animation */}
      <Background />

      <div className="form-style background-padding shop-login">
        <form onSubmit={onSubmit}>
          <h1>Store Login</h1>
          <div>
            {/* Email input field */}
            <label htmlFor="login-shop-email">Email</label>
            <EmailIcon />
            <input
              type="email"
              id="login-shop-email"
              name="shopEmail"
              value={shopEmail}
              placeholder="Email"
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>
          <div>
            {/* Password input field */}
            <label htmlFor="login-shop-password">Password</label>
            <span className="password-input">
              <PasswordIcon />
              <input
                type={showPassword ? "text" : "password"}
                id="login-shop-password"
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
            {/* Create store link */}
            <Link to="/shop/new" id="shop-register-new">
              Don't have a store yet? Create one now!
            </Link>
          </div>
          <div>
            {/* Forgot password link */}
            <Link to="/shop/password/forgot" id="shop-forgot-password">
              Forgot Password?
            </Link>
          </div>
          {/* Submit button */}
          <button type="submit" className="submit-button">
            Enter Store
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginShop;
