import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Background from "../layout/Background";
import Alert from "../utils/Alert";

import {
  newShop,
  clearMessage,
  clearErrors,
} from "../../features/shop/shopAuthSlice";

import PhoneNumberInput from "../layout/PhoneNumberInput";
import {
  EmailIcon,
  EyeIcon,
  EyeSlashIcon,
  PasswordIcon,
  UploadFileIcon,
  AddressIcon,
  StoreIcon,
  UserIcon,
  PhoneIcon,
} from "../../icons/FormIcons";

import "../Form.css";

const NewShop = () => {
  const dispatch = useDispatch();

  // Extract shopAuth state from redux store
  const { loading, error, message } = useSelector((state) => state.shopAuth);

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    shopName: "",
    shopEmail: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    zipCode: "",
    logo: "",
  });

  // Destructure the form data for easier access
  const {
    shopName,
    shopEmail,
    password,
    confirmPassword,
    phoneNumber,
    address,
    zipCode,
    logo,
  } = formData;

  // Update the formData state whenever an input field changes
  const onChange = (e) => {
    if (e.target.name === "logo") {
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

  // Dispatch newShop action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(newShop(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Become a Partner" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful shop registration */}
      {message && (
        <Alert message={message} clear={clearMessage} type={"success"} />
      )}

      {/* Background animation */}
      <Background />

      <div className="form-style background-padding">
        <form onSubmit={onSubmit} encType="multipart/form-data">
          <h1>Create Your Store</h1>
          <div>
            {/* ShopName input field */}
            <label htmlFor="register-shop-name">Store Name</label>
            <UserIcon />
            <input
              type="text"
              id="register-shop-name"
              name="shopName"
              value={shopName}
              placeholder="Store name"
              onChange={onChange}
              autoComplete="organization"
              required
            />
          </div>
          <div>
            {/* Email input field */}
            <label htmlFor="register-shop-email">Email</label>
            <EmailIcon />
            <input
              type="email"
              id="register-shop-email"
              name="shopEmail"
              value={shopEmail}
              placeholder="Email"
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="inline-flex">
            <div>
              {/* Password input field */}
              <label htmlFor="register-shop-password">Password</label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-shop-password"
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
              <label htmlFor="register-shop-confirm-password">
                Confirm Password
              </label>
              <span className="password-input">
                <PasswordIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-shop-confirm-password"
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
            {/* Phone number input field */}
            <label htmlFor="register-shop-phone">Phone Number</label>
            <PhoneIcon />
            <PhoneNumberInput
              name={"phoneNumber"}
              value={phoneNumber}
              onChange={onChange}
            />
          </div>
          <div>
            {/* Address input field */}
            <label htmlFor="register-shop-address">Address</label>
            {/* You can replace the following icon with an address icon */}
            <AddressIcon />
            <input
              type="text"
              id="register-shop-address"
              name="address"
              value={address}
              placeholder="Country, State, City, Street Address"
              onChange={onChange}
              autoComplete="address-level1 address-level2 address-level3 street-address"
              required
            />
          </div>
          <div>
            {/* Zip code input field */}
            <label htmlFor="register-shop-zip">Zip Code</label>
            <AddressIcon />
            <input
              type="text"
              id="register-shop-zip"
              name="zipCode"
              value={zipCode}
              placeholder="Zip code"
              onChange={onChange}
              autoComplete="postal-code"
              required
            />
          </div>
          <div>
            {/* Shop logo inut field */}
            <label htmlFor="register-logo">Store Logo</label>
            <div className="logo-wrapper">
              <div>
                {/* Render the user's avatar image if uploaded, otherwise use the default avatar */}
                {logo ? (
                  <img
                    src={logo}
                    className="rounded-circle"
                    width="96"
                    height="96"
                    alt="Store Logo"
                  />
                ) : (
                  <StoreIcon />
                )}
              </div>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="register-logo"
                  name="logo"
                  className="shop-input-upload"
                  accept="images/*"
                  onChange={onChange}
                  required
                />
                <UploadFileIcon />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-button">
            Create Store
          </button>
        </form>
      </div>
    </>
  );
};

export default NewShop;
