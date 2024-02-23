import React from "react";
import { Link } from "react-router-dom";

import { StarFillIcon, StarEmptyIcon } from "../../icons/ReviewIcons";
import "./ProductCard.css";
import "./ProductReviews.css";
import "../layout/PrimaryBtn.css";

const ProductCard = ({ product }) => {
  return (
    <article className="product-card">
      {/* Product image */}
      <Link to={`/product/${product._id}`} className="product-img">
        <img src={product.images[0].url} alt={product.name} />
      </Link>
      {/* Shop name */}
      <Link to={`/shop/info/${product.shopId}`} className="product-shop">
        {product.shopName}
      </Link>
      {/* Product name */}
      <p>{product.name}</p>
      {/* Product ratings and reviews */}
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
        <span>
          ({product.numOfReviews} review
          {product.numOfReviews !== 1 && "s"})
        </span>
      </div>
      {/* Product views */}
      <p>
        Viewed:{" "}
        {product.totalViews !== 1
          ? `${product.totalViews} times`
          : `${product.totalViews} time`}
      </p>
      {/* Product price and sold count */}
      <div className="price-and-sold">
        <span className="price">${product.price}</span>
        <span className="sold">Sold: {product.sold}</span>
      </div>
      {/* Link to product details */}
      <Link to={`/product/${product._id}`} className="more-details">
        {/* More details button */}
        <button type="submit" className="primary-btn">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          More Details
        </button>
      </Link>
    </article>
  );
};

export default ProductCard;
