import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import Alert from "../utils/Alert";

import { newReview, clearErrors } from "../../features/product/newReviewSlice";

import { StarEmptyIcon, StarFillIcon } from "../../icons/ReviewIcons";

import "../layout/SecondaryBtn.css";
import "../layout/Modal.css";
import "./NewReview.css";

const NewReview = ({ productId }) => {
  const dispatch = useDispatch();

  // Extract newReview state from redux store
  const { loading, error } = useSelector((state) => state.newReview);
  // Extract user state from redux store
  const { user } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const modalOverlayRef = useRef(null);

  // Close modal when clicking outside
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset textarea and stars value when closing the modal
    setComment("");
    setRating(0);
  };

  // Function to update comment
  const handleReviewChange = (e) => {
    setComment(e.target.value);
  };

  // Dispatch newReview action to the Redux store
  const handleSubmitReview = (e) => {
    e.preventDefault();
    dispatch(newReview({ rating, comment, productId, date: new Date() }));

    closeModal();
  };

  return (
    <>
      {/* Display loader while loading */}
      {loading && <Loader />}
      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display submit review button if user is logged in */}
      {user && Object.keys(user).length !== 0 && (
        <button className="secondary-btn" onClick={openModal}>
          Submit Your Review
        </button>
      )}

      {/* Modal for submitting review */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalOverlayRef}>
            <h1>Submit Review</h1>
            {/* Close button */}
            <button className="close-modal close-button" onClick={closeModal}>
              X
            </button>
            <hr />
            {/* Star rating */}
            <div className="review-inline">
              <div className="stars-container">
                <div
                  className="stars"
                  style={{ width: `${(rating / 5) * 100}%` }}
                >
                  <span className="empty-stars">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <span
                        key={index}
                        onClick={() => setRating(index)}
                        title={index}
                      >
                        <StarEmptyIcon />
                      </span>
                    ))}
                  </span>
                  <StarFillIcon />
                  <StarFillIcon />
                  <StarFillIcon />
                  <StarFillIcon />
                  <StarFillIcon />
                </div>
              </div>
            </div>
            {/* Review comment */}
            <textarea
              value={comment}
              onChange={handleReviewChange}
              placeholder="Write your review here..."
            />
            {/* Submit review button */}
            <button
              type="submit"
              className="secondary-btn"
              onClick={handleSubmitReview}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NewReview;
