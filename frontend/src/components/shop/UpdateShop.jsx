import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";
import Background from "../layout/Background";

import { getSellerShop } from "../../features/shop/shopAuthSlice";
import {
  clearErrors,
  updateShop,
  updateShopReset,
} from "../../features/shop/shopSlice";

import {
  EmailIcon,
  UploadFileIcon,
  AddressIcon,
  UserIcon,
  PhoneIcon,
} from "../../icons/FormIcons";
import "../Form.css";
import PhoneInput from "react-phone-input-2";
import "../layout/PhoneNumberInput.css";
import "react-phone-input-2/lib/style.css";

const UpdateShop = () => {
  const dispatch = useDispatch();

  // Extract shop and shopAuth state from redux store
  const { shop } = useSelector((state) => state.shopAuth);
  const { error, isUpdated, loading } = useSelector((state) => state.shop);

  // Define the initial state for form data
  const initialFormData = {
    shopName: shop.shopName,
    shopEmail: shop.shopEmail,
    logo: shop.logo.url,
    phoneNumber: shop.phoneNumber.toString(),
    address: shop.address,
    zipCode: shop.zipCode,
  };

  const [formData, setFormData] = useState(initialFormData);

  // Destructure the form data for easier access
  const { shopName, shopEmail, logo, phoneNumber, address, zipCode } = formData;

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

  // react-phone-input-2 library doesn't follow standard input element structure
  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phoneNumber: value });
  };

  // Dispatch updateShop and getSellerShop actions to the Redux store
  const onSubmit = async (e) => {
    e.preventDefault();
    // Check if profile data has been modified
    if (JSON.stringify(initialFormData) !== JSON.stringify(formData)) {
      await dispatch(updateShop(formData));
      await dispatch(getSellerShop());
    }
  };
  return (
    <>
      {/* Page title */}
      <PageTitle title="Update Shop" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful update */}
      {isUpdated && (
        <Alert
          message={"Shop updated successfully"}
          clear={updateShopReset}
          type={"success"}
        />
      )}

      {/* Background animation */}
      <Background />

      <div className="form-style background-padding">
        <form onSubmit={onSubmit}>
          <h1>Update Shop</h1>
          <div>
            {/* Shop name input field */}
            <label htmlFor="update-shop-name">Shop Name</label>
            <UserIcon />
            <input
              type="text"
              id="update-shop-name"
              name="shopName"
              value={shopName}
              placeholder="Shop name"
              onChange={onChange}
              autoComplete="organization"
              required
            />
          </div>
          <div>
            {/* Email input field */}
            <label htmlFor="update-shop-email">Email</label>
            <EmailIcon />
            <input
              type="email"
              id="update-shop-email"
              name="shopEmail"
              value={shopEmail}
              placeholder="Email"
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>
          <div>
            {/* Phone number input field */}
            <label htmlFor="update-shop-phone">Phone Number</label>
            <PhoneIcon />
            <PhoneInput
              value={phoneNumber.toString()}
              inputProps={{
                id: "update-shop-phone",
                name: "phoneNumber",
                placeholder: "+381",
                autoComplete: "tel",
                required: true,
              }}
              onChange={handlePhoneChange}
            />
          </div>
          <div>
            {/* Address input field */}
            <label htmlFor="update-shop-address">Address</label>
            {/* You can replace the following icon with an address icon */}
            <AddressIcon />
            <input
              type="text"
              id="update-shop-address"
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
            <label htmlFor="update-shop-zip">Zip Code</label>
            <AddressIcon />
            <input
              type="text"
              id="update-shop-zip"
              name="zipCode"
              value={zipCode}
              placeholder="Zip code"
              onChange={onChange}
              autoComplete="postal-code"
              required
            />
          </div>
          <div>
            {/* Logo input field */}
            <label htmlFor="update-logo">Logo</label>
            <div className="logo-wrapper">
              <div>
                <img
                  src={logo}
                  className="rounded-circle"
                  alt="Shop logo image"
                  width="96px"
                  height="96px"
                />
              </div>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="update-logo"
                  name="logo"
                  className="shop-input-upload"
                  accept="images/*"
                  onChange={onChange}
                />
                <UploadFileIcon />
              </div>
            </div>
          </div>
          {/* Submit button */}
          <button type="submit" className="submit-button">
            Update Shop
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateShop;
