import React from "react";
import { Link } from "react-router-dom";

import {
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
  GithubIcon,
  SitemapIcon,
} from "../../icons/SocialIcons";
import {
  StripeIcon,
  VisaIcon,
  PaypalIcon,
  MastercardIcon,
} from "../../icons/PaymentIcons";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        {/* Short contact info */}
        <div className="footer-column">
          <strong>Contact Information:</strong>
          <p>
            Address:
            <a
              href="https://www.google.com/maps/place/Generala+Gambete,+Negotin/@44.2270406,22.5230536,17z/data=!3m1!4b1!4m6!3m5!1s0x4753954907d8e8b3:0x2aaea736c5355b09!8m2!3d44.2270368!4d22.5256285!16s%2Fg%2F1hc13rsvk?entry=ttu"
              target="_blank"
            >
              Generala Gambete 9 Negotin, Serbia
            </a>
          </p>
          <p>
            Email:
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=igor.nikic.dev@gmail.com&su=IGZ%20Website&body=Dear%20developer%20Igor%20Nikic,"
              target="_blank"
            >
              igor.nikic.dev@gmail.com
            </a>
          </p>
          <p>
            Phone: <a href="tel:+381616602824">061-660-2824</a>
          </p>
        </div>
        {/* Company */}
        <div className="footer-column">
          <div>
            <Link to="#">
              <p>Contact Us</p>
            </Link>
          </div>
          <div>
            <Link to="#">
              <p>About Us</p>
            </Link>
          </div>
        </div>
        {/* Social media icons */}
        <div className="footer-column">
          <strong>Follow Us:</strong>
          <div className="social-icons">
            <Link to="#" title="Facebook">
              <FacebookIcon />
            </Link>
            <Link to="#" title="Instagram">
              <InstagramIcon />
            </Link>
            <Link to="#" title="Whatsapp">
              <WhatsappIcon />
            </Link>
            <Link to="#" title="Github">
              <GithubIcon />
            </Link>
          </div>
        </div>
        {/* Payment icons */}
        <div className="footer-column">
          <strong>Payment Options:</strong>
          <div className="payment-icons">
            <StripeIcon />
            <PaypalIcon />
            <MastercardIcon />
            <VisaIcon />
          </div>
        </div>
      </div>
      {/* Policy/Sitemap */}
      <div className="footer-info">
        <Link to="#" className="privacy-policy">
          <span>Privacy Policy</span>
        </Link>
        <Link to="#" className="sitemap">
          <span>
            <SitemapIcon />
            <p>Sitemap</p>
          </span>
        </Link>
        <span className="copyright">Infinity Gadget Zone &copy; 2023</span>
      </div>
    </footer>
  );
};

export default Footer;
