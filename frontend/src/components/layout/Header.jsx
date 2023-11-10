import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Alert from "../utils/Alert";
import Search from "./Search";

import {
  googleLogin,
  logout,
  clearErrors,
} from "../../features/user/authSlice";

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
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [isNavVisible, setNavVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  // Toggle dropdown onClick
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Toggle nav visibility for smaller devices
  const toggleNav = () => {
    setNavVisible(!isNavVisible);
  };

  // Dispatche logout action to the Redux store
  const logoutHandler = () => {
    dispatch(logout());
    setIsLogout(true);
    setTimeout(() => {
      setIsLogout(false);
    }, 5000);
  };

  useEffect(() => {
    // Show google one-tap login option if user is not authenticated
    if (!isAuthenticated && window.google) {
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
    }
  }, [isAuthenticated]);

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

  return (
    <header>
      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

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
            onClick={toggleNav}
          >
            <div className={`icon-1 ${isNavVisible ? "a" : ""}`} id="a"></div>
            <div className={`icon-2 ${isNavVisible ? "c" : ""}`} id="b"></div>
            <div className={`icon-3 ${isNavVisible ? "b" : ""}`} id="c"></div>
          </div>
        </div>

        {/* Navbar links for smaller devices */}
        <div className={`flex-center ${isNavVisible ? "show-nav" : ""}`}>
          {/* Profile dropdown */}
          <div
            className="avatar dropdown"
            title="Profile"
            onClick={toggleDropdown}
          >
            {user !== null && Object.keys(user).length !== 0 ? (
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
                    {user &&
                      (user.role === "admin" || user.role === "seller") && (
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
            ) : (
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
          <Link to="#" className="cart" title="Cart">
            <CartIcon />
            <span className="cart-count">1</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;