import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import Alert from "../utils/Alert";

import {
  deleteReview,
  clearErrors,
} from "../../features/product/deleteReviewSlice";

import { DeleteIcon } from "../../icons/ActionIcons";
import { StarFillIcon, StarEmptyIcon } from "../../icons/ReviewIcons";
import { formatDate } from "../utils/formatDate";
import "./ProductReviews.css";

const ProductReviews = ({ productId, reviews }) => {
  const dispatch = useDispatch();

  // Extract auth state from redux store
  const { user } = useSelector((state) => state.auth);
  // Extract deleteReview state from redux store
  const { loading, error } = useSelector((state) => state.deleteReview);

  const userId = user && user._id;

  // Dispatch deleteReview action to the Redux store
  const deleteReviewHandler = (e) => {
    e.preventDefault();
    dispatch(deleteReview({ productId, userId }));
  };

  return (
    <>
      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      <h3 className="review-inline">
        Other's Reviews: {reviews.length} review
        {reviews.length !== 1 && "s"}
      </h3>
      <div>
        {/* Product reviews */}
        {reviews &&
          reviews.map((review) => (
            <div key={review._id} className="review-container">
              <div className="review-inline">
                <img
                  src={review.avatar.url}
                  alt={review.username}
                  className="rounded-circle"
                  width="24px"
                  height="24px"
                />
                <p>{review.username}</p>
              </div>
              <div className="review-inline">
                <div className="stars-container">
                  <div
                    className="stars"
                    style={{ width: `${(review.rating / 5) * 100}%` }}
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
                <div>&nbsp; {formatDate(review.date)}</div>
              </div>

              {/* Review comment */}
              <p className="text-break">{review.comment}</p>

              {/* Delete review button */}
              {review.user === userId && (
                <button className="delete-icon" onClick={deleteReviewHandler}>
                  <DeleteIcon />
                </button>
              )}

              <hr />
            </div>
          ))}
      </div>
    </>
  );
};

export default ProductReviews;
