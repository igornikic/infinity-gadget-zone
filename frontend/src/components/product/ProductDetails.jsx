import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Alert from "../utils/Alert";
import ProductReviews from "./ProductReviews";
import NewReview from "./NewReview";

import {
  clearErrors,
  productDetails,
} from "../../features/product/productDetailsSlice";
import {
  addItemToCart,
  clearErrors as clearCartErrors,
} from "../../features/cart/cartSlice";

import { newReviewReset } from "../../features/product/newReviewSlice";
import { deleteReviewReset } from "../../features/product/deleteReviewSlice";

import {
  StripeIcon,
  VisaIcon,
  PaypalIcon,
  MastercardIcon,
} from "../../icons/PaymentIcons";
import {
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
} from "../../icons/SocialIcons";
import { StarEmptyIcon, StarFillIcon } from "../../icons/ReviewIcons";
import { CopyIcon, LinkIcon } from "../../icons/FormIcons";
import { EmailIcon } from "../../icons/FormIcons";
import { formatDate } from "../utils/formatDate";

import "../layout/PrimaryBtn.css";
import "../Carousel.css";
import "./ProductDetails.css";

const ProductDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  // Shareable link details
  const postUrl = encodeURI(document.location.href);
  const postTitle = encodeURI("Hi everyone, please check this out: ");
  // State to track current displayed carousel image index
  const [checkedIndex, setCheckedIndex] = useState(0);
  // State for quantity
  const [quantity, setQuantity] = useState(1);
  // Copy state 1 is for id copy, state 2 for share link copy
  const [copied, setCopied] = useState(0);

  const [cartAlert, setCartAlert] = useState(false);

  // State for zoom level
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState("50%");
  const [y, setY] = useState("50%");

  // Extract productDetails state from redux store
  const { product, loading, error } = useSelector(
    (state) => state.productDetails
  );
  // Extract newReview state from redux store
  const { success } = useSelector((state) => state.newReview);
  // Extract deleteReview state from redux store
  const { isDeleted } = useSelector((state) => state.deleteReview);

  // Dispatch productDetails on component mount
  useEffect(() => {
    dispatch(productDetails(id));
  }, []);

  // Update product details on successful review submission or deletion
  useEffect(() => {
    if (success) {
      dispatch(productDetails(id));
    }

    if (isDeleted) {
      dispatch(productDetails(id));
    }
  }, [success, isDeleted, id]);

  // Handle mouse move event to update coordinates
  const handleMouseMove = (e) => {
    setX(`${(100 * e.nativeEvent.offsetX) / e.target.offsetWidth}%`);
    setY(`${(100 * e.nativeEvent.offsetY) / e.target.offsetHeight}%`);
  };

  // Handle mouse enter event to set zoom
  const handleMouseEnter = () => {
    setZoom(2);
  };

  // Handle mouse leave event to reset zoom
  const handleMouseLeave = () => {
    setZoom(1);
  };

  // Copy text to clipboard
  const CopyToClipboard = (copyTxt, stateNum) => {
    setCopied(stateNum);
    navigator.clipboard.writeText(copyTxt);
    // Reset state after 2s
    setTimeout(() => {
      setCopied(0);
    }, 2000);
  };

  // Add item to cart
  const addToCart = (e) => {
    e.preventDefault();
    dispatch(addItemToCart({ id, quantity }));

    // Show cart alert message
    setCartAlert(true);
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title={product.name} />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful product creation */}
      {success && (
        <Alert
          message={"Your review has been posted."}
          clear={newReviewReset}
          type={"success"}
        />
      )}

      {/* Display success message upon successful product creation */}
      {isDeleted && (
        <Alert
          message={"Review Deleted successfully!"}
          clear={deleteReviewReset}
          type={"success"}
        />
      )}

      {/* Display success message upon successful add to cart action */}
      {cartAlert && (
        <Alert
          message={"Item added to cart successfully."}
          clear={() => setCartAlert(false)}
          type={"success"}
        />
      )}

      {/* Breadcrumb navigation */}
      <div className="breadcrumb-navigation">
        <span>
          <Link to="/">Home</Link>
          {" › "}
          <Link to={`/shop/info/${product.shopId}`}>{product.shopName}</Link>
          {" › "}
          <Link to={`/search/${product.name}`}>{product.name}</Link>
        </span>
      </div>

      <div className="product-details-container">
        <div className="product-details">
          <section>
            <div>
              {/* Product name */}
              <h1>{product.name}</h1>
              {/* Copy product ID to clipboard */}
              <div className="product-id">
                ID: # {product._id} &nbsp;
                <span
                  onClick={() => {
                    CopyToClipboard(product._id, 1);
                  }}
                >
                  <CopyIcon />
                </span>
                {copied === 1 && <small>&nbsp;Copied!</small>}
              </div>
              {/* Product ratings */}
              <div className="review-inline">
                <span>{product.ratings} </span>
                <div className="stars-container">
                  <div
                    className="stars"
                    style={{ width: `${(product.ratings / 5) * 100}%` }}
                  >
                    <span className="empty-stars">
                      <StarEmptyIcon />
                      <StarEmptyIcon />
                      <StarEmptyIcon />
                      <StarEmptyIcon />
                      <StarEmptyIcon />
                    </span>
                    <StarFillIcon />
                    <StarFillIcon />
                    <StarFillIcon />
                    <StarFillIcon />
                    <StarFillIcon />
                  </div>
                </div>
                {/* Product reviews */}
                <span>
                  ({product.numOfReviews} review
                  {product.numOfReviews !== 1 && "s"})
                </span>
              </div>
              {/* Product price */}
              <h2 className="details-price">
                <i>${product.price}</i>
              </h2>
              {/* Quantity input */}
              <div>
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                />
              </div>
              {/* Add to cart button */}
              <button
                type="submit"
                className="primary-btn"
                disabled={product.stock === 0}
                onClick={addToCart}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Add To Cart
              </button>
              <br />
              <br />
              <br />
              {/* Product stock */}
              <div>
                Quantity in stock:{" "}
                <span
                  className={product.stock > 0 ? "green-color" : "red-color"}
                >
                  <strong>{product.stock}</strong>
                </span>
              </div>
              {/* Sold */}
              <div>
                Sold: <strong>{product.sold}</strong>
              </div>
              {/* Category */}
              <div>Category: {product.category}</div>
              {/* Total veiws */}
              <div>Views: {product.totalViews}</div>
              {/* Posted date */}
              <div>
                Posted:{" "}
                {Object.keys(product).length !== 0 &&
                  formatDate(product.createdAt)}
              </div>
              {/* Seller */}
              <div>
                Sold By:
                <Link to={`/shop/info/${product.shopId}`}>
                  <i>{product.shopName}</i>
                </Link>
              </div>
            </div>
            {/* Safety */}
            <div className="safety">
              <strong>Checkout safety</strong>
              <hr />
              <div className="payment-icons">
                <StripeIcon />
                <PaypalIcon />
                <MastercardIcon />
                <VisaIcon />
              </div>
            </div>
            {/* Share options */}
            <div className="social-icons">
              <span>Share</span>
              <a
                target="_blank"
                href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}&amp;src=sdkpreparse`}
                title="Share by Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                target="_blank"
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out this cool product: ${product.name}\n${postUrl}`
                )}`}
                title="Share by Whatsapp"
              >
                <WhatsappIcon />
              </a>
              <a
                target="_blank"
                href={`https://twitter.com/share?url=${postUrl}&text=${postTitle}`}
                title="Share by Twitter"
              >
                <TwitterIcon />
              </a>
              <a
                target="_blank"
                href={`mailto:?subject=${encodeURIComponent(
                  `Shared find IGZ: ${product.name}`
                )}&body=${encodeURIComponent(
                  `Check out this cool product: ${product.name}\n${postUrl}`
                )}`}
                title="Share by Email"
              >
                <EmailIcon />
              </a>
              <span
                className="copy-link"
                onClick={() => {
                  CopyToClipboard(postUrl, 2);
                }}
                title="Share by Link"
              >
                <LinkIcon />
              </span>
              {copied === 2 && <small>&nbsp;Copied!</small>}
            </div>
          </section>
        </div>
        {/* Carousel */}
        <div className="product-image">
          <div className="carousel">
            <div className="carousel-inner">
              {product.images &&
                product.images.map((image, index) => (
                  <div key={index}>
                    <input
                      className="carousel-open"
                      type="radio"
                      id={`carousel-${index}`}
                      name="carousel"
                      aria-hidden="true"
                      hidden=""
                      defaultChecked={index === 0 && "checked"}
                      onClick={() => setCheckedIndex(index)}
                    />
                    <div className="carousel-item">
                      <img
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: `${x} ${y}`,
                          clipPath: `inset(
                            calc((1 - 1/${zoom}) * ${y})
                            calc((1 - 1/${zoom}) * (100% - ${x}))
                            calc((1 - 1/${zoom}) * (100% - ${y}))
                            calc((1 - 1/${zoom}) * ${x})
                          )`,
                          cursor: "crosshair",
                          willChange: "transform",
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        src={image.url}
                        alt={`Product Image ${index}`}
                      />
                    </div>
                    {/* Carousel control buttons */}
                    {product.images.length > 1 && (
                      <>
                        <label
                          htmlFor={`carousel-${
                            index === 0 ? product.images.length - 1 : index - 1
                          }`}
                          className={`carousel-control prev control-${index}`}
                          style={{
                            display: checkedIndex === index && "block",
                          }}
                        >
                          ‹
                        </label>
                        <label
                          htmlFor={`carousel-${
                            index === product.images.length - 1 ? 0 : index + 1
                          }`}
                          className={`carousel-control next control-${index}`}
                          style={{
                            display: checkedIndex === index && "block",
                          }}
                        >
                          ›
                        </label>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product description */}
      <div className="more-product-details">
        <div>
          <label htmlFor="product-details-description">Description:</label>
          <br />
          <textarea
            id="product-details-description"
            rows="10"
            cols="100"
            defaultValue={product.description}
            disabled
          ></textarea>
        </div>

        {/* Link to shop */}
        <Link to={`/products/shop/${product.shopId}`}>More shop products</Link>
      </div>

      <div className="list-reviews-container">
        {/* Review Modal */}
        <NewReview productId={product._id} />

        {/* Product reviews */}
        <div>
          <br />
          {product.reviews && product.reviews.length > 0 && (
            <ProductReviews productId={product._id} reviews={product.reviews} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
