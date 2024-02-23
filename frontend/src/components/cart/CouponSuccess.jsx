import React, { useState, useEffect, useRef } from "react";

import Confetti from "../layout/Confetti";
import { formatDate } from "../utils/formatDate";

import "../layout/Modal.css";
import "./CouponSuccess.css";

const CouponSuccess = ({ coupon, discountValue, productsDiscounted }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const modalOverlayRef = useRef(null);

  // Close modal when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalOverlayRef.current &&
        !modalOverlayRef.current.contains(event.target)
      ) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div>
          <div className="modal-overlay">
            <Confetti />
            <div className="modal-content coupon-success" ref={modalOverlayRef}>
              {/* Close button */}
              <button className="close-modal close-button" onClick={closeModal}>
                X
              </button>

              {/* Coupon details */}
              <h1>{coupon.name}</h1>
              <span>
                Coupon Code:
                <h2 className="modal-coupon-code">{coupon.code}</h2>
              </span>

              {/* Discount type and value */}
              <p>
                {coupon.discountType === "percentage" ? (
                  <span>
                    Discount Percentage:{" "}
                    <b className="red-color">-{coupon.discountValue}%</b>
                  </span>
                ) : (
                  <span>
                    Discount Amount:{" "}
                    <b className="red-color">- ${coupon.discountValue}</b>
                  </span>
                )}
              </p>

              {/* Coupon details */}
              <p>Number of Discounted Products: {productsDiscounted}</p>
              <p>Event start: {formatDate(coupon.createdAt)}</p>
              <p>Event end: &nbsp;{formatDate(coupon.expirationDate)}</p>
              <div>
                <button className="you-saved-button" onClick={closeModal}>
                  You Saved: ${discountValue}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CouponSuccess;
