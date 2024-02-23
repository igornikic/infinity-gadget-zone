import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";
import CouponSuccss from "./CouponSuccess";

import {
  addItemToCart,
  clearErrors as clearCartErrors,
  removeItemFromCart,
} from "../../features/cart/cartSlice";
import {
  applyCoupon,
  clearErrors as clearCouponErrors,
} from "../../features/cart/couponSlice";

import "../layout/SecondaryBtn.css";
import "../layout/PrimaryBtn.css";
import "./Cart.css";

const Cart = () => {
  const dispatch = useDispatch();

  // Extract cart state from redux store
  const { cartItems, error: cartError } = useSelector((state) => state.cart);

  // Extract coupon state from redux store
  const { coupon, error: couponError } = useSelector((state) => state.coupon);

  const [couponInputs, setCouponInputs] = useState(
    Array(cartItems.length).fill(["", "", ""])
  );

  useEffect(() => {
    // Update localStorage with current cartItems
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const removeCartItemHandler = (id) => {
    dispatch(removeItemFromCart(id));
  };

  const increaseQty = (id, quantity, stock) => {
    const newQty = quantity + 1;

    if (newQty > stock) return;

    dispatch(addItemToCart({ id, quantity: newQty }));
  };

  const decreaseQty = (id, quantity) => {
    const newQty = quantity - 1;

    if (newQty <= 0) return;

    dispatch(addItemToCart({ id, quantity: newQty }));
  };

  const checkoutHandler = () => {
    // navigate("/login?redirect=shipping");
  };

  const handleInput = (itemIndex, inputIndex, value) => {
    const newInputs = [...couponInputs];
    newInputs[itemIndex] = [...newInputs[itemIndex]]; // Copy array for immutability
    newInputs[itemIndex][inputIndex] = value;

    // Move focus to next input
    if (value.length === 4 && inputIndex < 2) {
      const nextInput = document.getElementById(
        `code-input${itemIndex + 1}-${inputIndex + 2}`
      );

      if (nextInput) {
        nextInput.focus();
      }
    }

    setCouponInputs(newInputs);
  };

  const applyCouponHandler = async (itemIndex, item) => {
    // Dispatch applyCoupon action with input values
    const code = couponInputs[itemIndex].join("-");

    dispatch(applyCoupon({ code, product: item }));
  };

  // Function to check if all inputs for an item are filled
  const areInputsFilled = (itemIndex) => {
    return couponInputs[itemIndex].every((value) => value.length === 4);
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title={"Cart"} />

      {/* Display error message if there is an error in the cart slice */}
      {cartError && (
        <Alert message={cartError} clear={clearCartErrors} type={"error"} />
      )}

      {/* Display error message if there is an error in the coupon slice */}
      {couponError && (
        <Alert message={couponError} clear={clearCouponErrors} type={"error"} />
      )}

      {cartItems.length === 0 ? (
        <h2>Your Cart is Empty</h2>
      ) : (
        <>
          {/* Cart Items */}
          <h2>
            Your Cart:{" "}
            <b>
              {cartItems.length !== 1
                ? `${cartItems.length} items`
                : `${cartItems.length} item`}
            </b>
          </h2>

          <hr />
          <div>
            {cartItems.map((item, itemIndex) => (
              <div key={itemIndex} className="cart-container">
                <div className="cart-item" key={item.productId}>
                  <img
                    src={item.image}
                    alt={item.name}
                    width="auto"
                    height="96px"
                  />

                  <Link to={`/product/${item.productId}`}>{item.name}</Link>

                  <span>
                    ${item.price} <b>X</b>
                  </span>

                  {/* Quantity controls */}
                  <div className="quantity-container">
                    <button
                      className="secondary-btn"
                      onClick={() => decreaseQty(item.productId, item.quantity)}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      name="quantity-input"
                      value={item.quantity}
                      id="quantity-input"
                      aria-label="quantiy-input"
                      disabled
                      readOnly
                    />

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        increaseQty(item.productId, item.quantity, item.stock)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-price">
                    {/* Item price */}
                    <div>
                      ={" "}
                      <span className="item-total">
                        {(item.quantity * item.price).toFixed(2)} $
                      </span>
                    </div>

                    {/* Discount amount */}
                    {item.discountValue !== undefined &&
                      item.productsDiscounted !== undefined && (
                        <>
                          <div>
                            <p className="red-color">- {item.discountValue}$</p>
                          </div>
                          <div>
                            <p className="item-total">
                              ={" "}
                              {(
                                item.quantity * item.price -
                                item.discountValue
                              ).toFixed(2)}
                              $
                            </p>
                          </div>

                          {/* Render coupon applied successfully popup */}
                          {Object.keys(coupon).length > 0 && (
                            <CouponSuccss
                              coupon={coupon}
                              discountValue={item.discountValue}
                              productsDiscounted={item.productsDiscounted}
                            />
                          )}
                        </>
                      )}
                  </div>
                </div>
                <div className="coupon">
                  {couponInputs[itemIndex].map((value, inputIndex) => (
                    <div key={inputIndex}>
                      <input
                        type="text"
                        id={`code-input${itemIndex + 1}-${inputIndex + 1}`}
                        className="code-inputs"
                        maxLength="4"
                        value={value}
                        placeholder="XXXX"
                        aria-label={`code-input${itemIndex + 1}-${
                          inputIndex + 1
                        }`}
                        autoComplete="off"
                        onChange={(e) =>
                          handleInput(itemIndex, inputIndex, e.target.value)
                        }
                      />
                      {inputIndex < couponInputs[itemIndex].length - 1 && (
                        <span>-</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="apply-container">
                  <button
                    className="apply-button"
                    onClick={() => applyCouponHandler(itemIndex, item)}
                    disabled={!areInputsFilled(itemIndex)}
                  >
                    Apply Coupon
                  </button>
                </div>

                <button
                  className="remove-item-button"
                  onClick={() => removeCartItemHandler(item.productId)}
                >
                  X
                </button>
                <hr />
              </div>
            ))}
          </div>

          <div className="order-summary">
            <span className="summary">Order Summary</span>
            <span>
              <strong>
                {cartItems.reduce(
                  (acc, item) => acc + Number(item.quantity),
                  0
                )}{" "}
                {cartItems.reduce(
                  (acc, item) => acc + Number(item.quantity),
                  0
                ) !== 1
                  ? "(Units)"
                  : "(Unit)"}
              </strong>
              <div>Total items</div>
            </span>
            <span>
              <strong className="cart-total">
                {cartItems
                  .reduce((acc, item) => {
                    const itemTotal =
                      item.quantity * item.price - (item.discountValue || 0);
                    return acc + itemTotal;
                  }, 0)
                  .toFixed(2)}{" "}
                $
              </strong>
              <div>Subtotal</div>
            </span>
            <span>
              <Link to="/shipping">
                <button className="primary-btn" onClick={checkoutHandler}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  Checkout
                </button>
              </Link>
            </span>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
