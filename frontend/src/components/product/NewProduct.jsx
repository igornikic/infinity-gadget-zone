import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Background from "../layout/Background";
import Alert from "../utils/Alert";

import {
  clearErrors,
  newProduct,
  newProductReset,
} from "../../features/product/newProductSlice";

import { categories } from "../../constants/categories";
import { UploadFileIcon } from "../../icons/FormIcons";
import "../layout/Modal.css";
import "../Form.css";
import "../Carousel.css";

const NewProduct = () => {
  const dispatch = useDispatch();

  // Extract newProduct state from redux store
  const { loading, success, error } = useSelector((state) => state.newProduct);

  // State to track current displayed carousel image index
  const [checkedIndex, setCheckedIndex] = useState(0);

  // Define the initial state for form data
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    images: [],
    category: "",
    stock: 0,
    shop: "",
  });

  // Destructure the form data for easier access
  const { name, price, description, images, category, stock, shop } = formData;

  // Update the formData state whenever an input field changes
  const onChange = (e) => {
    if (e.target.name === "images") {
      const files = Array.from(e.target.files);
      let imageArray = [];

      // Use Promise.all to handle asynchronous file reading
      Promise.all(
        files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = () => {
              if (reader.readyState === 2) {
                imageArray.push(reader.result);
                resolve();
              }
            };

            reader.readAsDataURL(file);
          });
        })
      ).then(() => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [e.target.name]: [...prevFormData.images, ...imageArray],
        }));
      });
    } else {
      // Update other form data fields
      setFormData((prevFormData) => ({
        ...prevFormData,
        [e.target.name]: e.target.value,
      }));
    }
  };

  // Function to remove an image from the array
  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });

    // If removed image was the last one, update checkedIndex
    if (index === checkedIndex && updatedImages.length > 0) {
      const newCheckedIndex =
        index === updatedImages.length ? index - 1 : index;
      setCheckedIndex(newCheckedIndex);
    }
  };

  // Dispatch newProduct action to the Redux store
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(newProduct(formData));
  };

  return (
    <>
      {/* Page title */}
      <PageTitle title="Create Product" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Display success message upon successful product creation */}
      {success && (
        <Alert
          message={"Product Created Successfully!"}
          clear={newProductReset}
          type={"success"}
        />
      )}

      {/* Background animation */}
      <Background />

      <div className="form-style background-padding">
        <form onSubmit={onSubmit} encType="multipart/form-data">
          <h1>Create Product</h1>
          <div>
            {/* Name input field */}
            <label htmlFor="product-name">Product Name</label>
            <input
              type="text"
              id="product-name"
              name="name"
              value={name}
              placeholder="Product Name"
              onChange={onChange}
              autoComplete="off"
              required
            />
          </div>
          <div>
            {/* Price input field */}
            <label htmlFor="product-price">Product Price</label>
            <input
              type="number"
              id="product-price"
              name="price"
              value={price}
              min={0}
              placeholder="Product Price"
              onChange={onChange}
              autoComplete="off"
              step="0.01"
              required
            />
          </div>
          <div>
            {/* Stock input field */}
            <label htmlFor="product-stock">Product Stock</label>
            <input
              type="number"
              id="product-stock"
              name="stock"
              value={stock}
              min={0}
              placeholder="Product Stock"
              onChange={onChange}
              autoComplete="off"
              required
            />
          </div>
          <div>
            {/* Description field */}
            <label htmlFor="product-description">Description</label>
            <textarea
              type="text"
              id="product-description"
              name="description"
              value={description}
              placeholder="Describe this product ..."
              rows="10"
              onChange={onChange}
              autoComplete="off"
              required
            ></textarea>
          </div>
          <div>
            {/* Category field */}
            <label htmlFor="product-category">Product Category</label>
            <select
              name="category"
              id="product-category"
              onChange={onChange}
              defaultValue="Choose a category"
            >
              <option value="Choose a category" hidden disabled>
                Choose a category
              </option>
              {categories &&
                categories.map((category, index) => {
                  return (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  );
                })}
            </select>
          </div>
          <div>
            {/* Images inut field */}
            <label htmlFor="product-images">Product Images</label>
            <div className="carousel">
              <div className="carousel-inner">
                {/* Render product images if uploaded, otherwise render default svg */}
                {images &&
                  images.map((image, index) => (
                    <div key={index}>
                      <input
                        className="carousel-open"
                        type="radio"
                        id={`carousel-${index}`}
                        name="carousel"
                        aria-hidden="true"
                        hidden=""
                        checked={checkedIndex === index && "checked"}
                        onChange={() => setCheckedIndex(index)}
                      />
                      {/* Remove image button */}
                      <div className="carousel-item">
                        <img src={image} alt={`Product Image ${index}`} />
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => removeImage(index)}
                        >
                          X
                        </button>
                      </div>
                      {/* Carousel control buttons */}
                      {images.length > 1 && (
                        <>
                          <label
                            htmlFor={`carousel-${
                              index === 0 ? images.length - 1 : index - 1
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
                              index === images.length - 1 ? 0 : index + 1
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
            <div className="file-input-wrapper">
              <input
                type="file"
                id="product-images"
                name="images"
                className="product-input-upload"
                accept="images/*"
                onChange={onChange}
                title={`${images.length} images uploaded`}
                multiple
                required
              />
              <UploadFileIcon />
            </div>
          </div>
          {/* Submit button */}
          <button type="submit" className="submit-button">
            Create Product
          </button>
        </form>
      </div>
    </>
  );
};

export default NewProduct;
