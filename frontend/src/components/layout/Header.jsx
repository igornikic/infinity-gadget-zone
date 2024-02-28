import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Alert from "../utils/Alert";
import Search from "./Search";

import {
  googleLogin,
  logout,
  clearErrors as clearUserErrors,
} from "../../features/user/authSlice";
import {
  logoutShop,
  clearErrors as clearShopErrors,
} from "../../features/shop/shopAuthSlice";

import logo from "../../assets/logo-52x48.webp";
import {
  AvatarIcon,
  RegisterIcon,
  LoginIcon,
  CartIcon,
  OrderIcon,
  DashboardIcon,
  ProfileIcon,
  LogoutIcon,
} from "../../icons/NavIcons";
import "./Header.css";

const Header = () => {
  const dispatch = useDispatch();

  // Extract auth state from redux store
  const {
    user,
    isAuthenticated,
    error: userError,
  } = useSelector((state) => state.auth);
  // Extract shopAuth state from redux store
  const {
    shop,
    isSeller,
    error: shopError,
  } = useSelector((state) => state.shopAuth);
  // Extract cart state from redux store
  const { cartItems } = useSelector((state) => state.cart);

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  // Check is object empty
  const isNotEmpty = (obj) => {
    return obj !== null && Object.entries(obj).length !== 0;
  };

  // Toggle dropdown onClick
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Dispatch logout action to the Redux store
  const logoutHandler = () => {
    const logoutAction = isAuthenticated ? logout() : logoutShop();

    dispatch(logoutAction);

    setIsLogout(true);
    setTimeout(() => {
      setIsLogout(false);
    }, 3000);
  };

  useEffect(() => {
    // Show google one-tap login option if user is not authenticated
    if (window.google && !isAuthenticated && !isSeller) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: "signin",
        callback: (response) => {
          // Check if user picked google account
          if (response.credential) {
            const token = { token: response.credential };
            dispatch(googleLogin(token));
          }
        },
      });
      window.google.accounts.id.prompt();
    } else if (window.google) {
      window.google.accounts.id.cancel();
    }
  }, [isAuthenticated, isSeller]);

  useEffect(() => {
    // Close dropdown if we click outside of it's content
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".dropdown")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      // Always visible for desktop devices
      setIsNavVisible(window.innerWidth > 768);
    };

    // Attach resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header>
      {/* Display error message if there is an error in the user slice */}
      {userError && (
        <Alert message={userError} clear={clearUserErrors} type={"error"} />
      )}

      {/* Display error message if there is an error in the shopAuth slice */}
      {shopError && (
        <Alert message={shopError} clear={clearShopErrors} type={"error"} />
      )}

      {/* Display success message upon successful logout  */}
      {isLogout && (
        <Alert message={"Logged Out Successfully"} type={"success"} />
      )}

      <nav>
        {/* Company logo */}
        <Link to="/" className="logo">
          <img
            src={logo}
            alt="Logo"
            width="55"
            height="48"
            className="rounded-circle"
          />
        </Link>

        {/* Search input field */}
        <Search history={history} className="search" />

        {/* Hamburger button for smaller devices */}
        <div className="removed">
          <div
            className="hamburger-icon"
            id="icon"
            data-testid="hamburger-icon"
            onClick={() => {
              setIsNavVisible(!isNavVisible);
            }}
          >
            <div className={`icon-1 ${isNavVisible ? "a" : ""}`} id="a"></div>
            <div className={`icon-2 ${isNavVisible ? "c" : ""}`} id="b"></div>
            <div className={`icon-3 ${isNavVisible ? "b" : ""}`} id="c"></div>
          </div>
        </div>

        {/* Navbar links for smaller devices */}
        <div
          className={`flex-center ${isNavVisible ? "show-nav" : "hide-nav"}`}
        >
          {/* Profile dropdown */}
          <div
            className="avatar dropdown"
            title="Profile"
            onClick={toggleDropdown}
          >
            {/* Show user dropdown if user object is present */}
            {isNotEmpty(user) && (
              <>
                {/* User avatar image */}
                <img
                  src={user && user.avatar.url}
                  width="24px"
                  height="24px"
                  alt="Avatar"
                  className="rounded-circle"
                />
                {isOpen && (
                  <ul className="dropdown-menu">
                    {user && user.role === "admin" && (
                      <li>
                        {/* Dashboard link */}
                        <Link to="#">
                          <pre>
                            <DashboardIcon /> Dashboard
                          </pre>
                        </Link>
                      </li>
                    )}
                    <li>
                      {/* Profile link */}
                      <Link to="/me">
                        <pre>
                          <ProfileIcon /> Profile
                        </pre>
                      </Link>
                    </li>
                    <li>
                      {/* Logout */}
                      <Link to="/" onClick={logoutHandler}>
                        <pre>
                          <LogoutIcon /> Logout
                        </pre>
                      </Link>
                    </li>
                  </ul>
                )}
              </>
            )}
            {/* Show shop dropdown if shop object is present */}
            {isNotEmpty(shop) && (
              <>
                {/* Shop logo image */}
                <img
                  src={shop && shop.logo.url}
                  width="24px"
                  height="24px"
                  alt="Shop logo"
                  className="rounded-circle"
                />
                {isOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      {/* Dashboard link */}
                      <Link to="#">
                        <pre>
                          <DashboardIcon /> Dashboard
                        </pre>
                      </Link>
                    </li>
                    <li>
                      {/* Profile link */}
                      <Link to="/shop/me">
                        <pre>
                          <ProfileIcon /> Profile
                        </pre>
                      </Link>
                    </li>
                    <li>
                      {/* Logout */}
                      <Link to="/" onClick={logoutHandler}>
                        <pre>
                          <LogoutIcon /> Logout
                        </pre>
                      </Link>
                    </li>
                  </ul>
                )}
              </>
            )}
            {/* Show register and login options if user and shop are both empty */}
            {!isNotEmpty(user) && !isNotEmpty(shop) && (
              <>
                <AvatarIcon className="dropdown-toggle" />
                {isOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      {/* Register link */}
                      <Link to="/register">
                        <pre>
                          <RegisterIcon /> Register
                        </pre>
                      </Link>
                    </li>
                    <li>
                      {/* Login link */}
                      <Link to="/login">
                        <pre>
                          <LoginIcon /> Login
                        </pre>
                      </Link>
                    </li>
                  </ul>
                )}
              </>
            )}
          </div>
          {/* Order link */}
          <Link to="#" className="order" title="Orders">
            <OrderIcon />
          </Link>
          {/* Cart link */}
          <Link to="/cart" className="cart" title="Cart">
            <CartIcon />
            <span className="cart-count">{cartItems.length}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
