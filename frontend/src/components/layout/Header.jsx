import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Search from "./Search";

import logo from "../../assets/logo-52x48.webp";
import {
  AvatarIcon,
  RegisterIcon,
  LoginIcon,
  CartIcon,
  OrderIcon,
} from "../../icons/NavIcons";
import "./Header.css";

const Header = () => {
  const [isNavVisible, setNavVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown onClick
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Toggle nav visibility for smaller devices
  const toggleNav = () => {
    setNavVisible(!isNavVisible);
  };

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
          <div className="hamburger-icon" id="icon" onClick={toggleNav}>
            <div className={`icon-1 ${isNavVisible ? "a" : ""}`} id="a"></div>
            <div className={`icon-2 ${isNavVisible ? "c" : ""}`} id="b"></div>
            <div className={`icon-3 ${isNavVisible ? "b" : ""}`} id="c"></div>
          </div>
        </div>

        {/* Navbar links for smaller devices */}
        <div className={`flex-center ${isNavVisible ? "show" : ""}`}>
          {/* Profile dropdown */}
          <div
            className="avatar dropdown"
            title="Profile"
            onClick={toggleDropdown}
          >
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
