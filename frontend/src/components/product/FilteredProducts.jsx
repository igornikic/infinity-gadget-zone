import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "./ProductCard";
import Loader from "../layout/Loader";
import PageTitle from "../layout/PageTitle";
import Background from "../layout/Background";
import Pagination from "../layout/Pagination";
import { categories } from "../../constants/categories";

import { StarEmptyIcon, StarFillIcon } from "../../icons/ReviewIcons";
import { FilterIcon } from "../../icons/ActionIcons";
import "../layout/Search.css";
import "../layout/SecondaryBtn.css";
import "./GetProducts.css";
import "./FilteredProducts.css";

const FilteredProducts = ({ keyword, id, getProductsAction }) => {
  const dispatch = useDispatch();

  // Extract products state from redux store
  const { loading, products, resPerPage, filteredProductsCount } = useSelector(
    (state) => state.products
  );

  // State for current page
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const defaultFilter = {
    minPrice: 0,
    maxPrice: 100_000_000,
    category: "",
    rating: 0,
    sort: "price",
  };

  // State for filtering options
  const [filter, setFilter] = useState(defaultFilter);

  // Destructure the filter options for easier access
  const { minPrice, maxPrice, category, rating, sort } = filter;

  // Effect to fetch products based on filter data
  useEffect(() => {
    // Check if price field is empty
    const arePricesEmpty = minPrice === "" || maxPrice === "";

    // If price field is empty, do not dispatch
    if (!arePricesEmpty) {
      dispatch(
        getProductsAction({
          keyword,
          currentPage,
          price: [minPrice, maxPrice],
          category,
          rating,
          sort,
          id: id || undefined,
        })
      );
    }
  }, [keyword, currentPage, minPrice, maxPrice, category, rating, sort]);

  // Update the filter state
  const onChange = (e) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [e.target.name]: e.target.value,
    }));
  };

  // Reset filter state
  const resetFilters = () => {
    setFilter(defaultFilter);
  };

  // Calculate the total number of pages
  const pageCount = Math.ceil(filteredProductsCount / resPerPage);

  // Handler for pagination page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredMinPrice =
    products && products.length > 0
      ? Math.min(...products.map((product) => product.price))
      : "";

  const filteredMaxPrice =
    products && products.length > 0
      ? Math.max(...products.map((product) => product.price))
      : "";

  return (
    <>
      {/* Page title */}
      <PageTitle title="Create Product" />

      {/* Display loader while loading */}
      {loading && <Loader />}

      <div className="toggle-filter">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <div>
            <FilterIcon /> Filters
          </div>
        </button>
      </div>
      <div className="filtered-products-container">
        <div className={`filters ${isOpen ? "" : "hidden"}`}>
          {/* Sorting options */}
          <div>
            <label htmlFor="sort">Sort:</label>
            <select id="sort" name="sort" onChange={onChange} value={sort}>
              <option value="createdAt">Newer</option>
              <option value="-createdAt">Older</option>
              <option value="views">Popular</option>
              <option value="price">Cheaper</option>
              <option value="-price">Costlier</option>
            </select>
          </div>

          <div>
            <p>
              <strong>Products found:</strong> {filteredProductsCount}
            </p>
          </div>

          {/* Price filter inputs */}
          <div className="price-filter">
            <div>
              <p>
                <strong>Price range found:</strong>{" "}
                {products.length > 0 &&
                  Math.min(...products.map((product) => product.price))}
                &nbsp;-&nbsp;
                {products.length > 0 &&
                  Math.max(...products?.map((product) => product.price))}
              </p>
            </div>
            {/* Min price inpput field */}
            <div>
              <label htmlFor="min-price">Min Price:</label>
              <input
                type="number"
                id="min-price"
                name="minPrice"
                value={minPrice === 0 ? filteredMinPrice : minPrice}
                min={0}
                placeholder="Min"
                onChange={onChange}
                autoComplete="off"
              />
            </div>
            {/* Max price input field */}
            <div>
              <label htmlFor="max-price">Max Price:</label>
              <input
                type="number"
                id="max-price"
                name="maxPrice"
                value={maxPrice === 100_000_000 ? filteredMaxPrice : maxPrice}
                min={0}
                placeholder="Max"
                onChange={onChange}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Category filter options */}
          <div>
            <label htmlFor="filter-category">Category:</label>
            <select
              id="filter-category"
              name="category"
              defaultValue="Choose a category"
              onChange={onChange}
            >
              <option value="Choose a category" hidden disabled>
                Choose a category
              </option>
              {categories &&
                categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          {/* Rating filter */}
          <div className="rating-filter-container">
            <p className="rating-text">
              <strong>Rating: </strong>
            </p>
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
                        onClick={() =>
                          setFilter((prevFilter) => ({
                            ...prevFilter,
                            rating: index,
                          }))
                        }
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
          </div>

          {/* Remove All Filters button */}
          <button
            name="remove-all-filters"
            className="secondary-btn remove-filters"
            onClick={resetFilters}
          >
            Remove All Filters
          </button>
        </div>

        {/* Display products if there are any */}
        <div className="filtered-products">
          <div className="product-container">
            <Background />
            {products.length > 0 &&
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            {/* Display message that there is no products */}
            {!loading && products.length === 0 && (
              <p>Oops, we don't have what you are looking for.</p>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            pageCount={pageCount}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default FilteredProducts;
