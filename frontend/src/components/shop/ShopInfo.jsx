import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Background from "../layout/Background";
import Alert from "../utils/Alert";

import { shopInfo, clearErrors } from "../../features/shop/shopInfoSlice";
import { formatDate } from "../utils/formatDate";

import {
  EmailIcon,
  AddressIcon,
  PhoneIcon,
  CalendarIcon,
} from "../../icons/FormIcons";
import { ChatIcon } from "../../icons/ChatIcons";

import "../Profile.css";
import "../Form.css";

const ShopInfo = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  // Extract shopInfo state from redux store
  const { shop, loading, error } = useSelector((state) => state.shopInfo);

  // Dispatch shopInfo on component mount
  useEffect(() => {
    dispatch(shopInfo(id));
  }, []);

  return (
    <>
      {/* Page title */}
      <PageTitle title={`${shop.shopName}`} />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Background animation */}
      <Background />

      <div className="profile-row">
        <div className="profile-col">
          <h1>{shop.shopName}</h1>
          <div className="profile-image">
            {/* Shop logo */}
            <img
              src={shop.logo && shop.logo.url}
              alt="Shop Logo"
              className="logo"
            />
          </div>
          {/* Chat button */}
          <Link to="#">
            <button type="button" className="submit-button">
              <div className="profile-chat">
                Chat &nbsp;
                <ChatIcon />
              </div>
            </button>
          </Link>
        </div>
        {/* Shop info */}
        <div className="profile-col">
          <div>
            <p>
              Email <EmailIcon />
            </p>
            <strong>
              <a
                href={`mailto:${shop.shopEmail}?subject=${encodeURIComponent(
                  `IGZ -`
                )}`}
                target="_blank"
              >
                {shop.shopEmail}
              </a>
            </strong>
          </div>
          <div>
            <p>
              Phone Number <PhoneIcon />
            </p>
            <strong>
              <a href={`tel:+${shop.phoneNumber}`}>
                {" "}
                +
                {shop.phoneNumber &&
                  shop.phoneNumber.toString().replace(/(\d{3})(?=\d)/g, "$1 ")}
              </a>
            </strong>
          </div>
          <div>
            <p>
              Address
              <AddressIcon />
            </p>
            <strong>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${shop.address}, ${shop.zipCode}`}
                target="_blank"
              >
                {shop.address}
              </a>
            </strong>
          </div>
        </div>
        <div className="profile-col">
          <div>
            <p>
              ZIP Code
              <AddressIcon />
            </p>
            <strong>{shop.zipCode}</strong>
          </div>
          <div>
            <p>
              Partner Since <CalendarIcon />
            </p>
            <strong>
              {Object.keys(shop).length !== 0 && formatDate(shop.createdAt)}
            </strong>
          </div>
          {/* Shop products button */}
          <Link to={`/products/shop/${shop._id}`}>
            <button type="button" className="submit-button">
              Shop Products
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ShopInfo;
