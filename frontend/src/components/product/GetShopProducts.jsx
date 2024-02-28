import React from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import {
  getShopProducts,
  clearErrors,
} from "../../features/product/productsSlice";

import Alert from "../utils/Alert";

import FilteredProducts from "./FilteredProducts";

const GetShopProducts = () => {
  const { id, keyword } = useParams();

  // Extract products state from redux store
  const { products, error } = useSelector((state) => state.products);

  return (
    <>
      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Breadcrumb navigation */}
      <div className="breadcrumb-navigation">
        <span>
          <Link to="/">Home</Link>
          {" › "}
          <Link to={`/shop/info/${products.length > 0 && products[0].shopId}`}>
            {products.length > 0 && products[0].shopName}
          </Link>
          {keyword && (
            <>
              {" › "}
              <Link
                to={`/products/shop/${
                  products.length > 0 && products[0].shopId
                }/${keyword}`}
              >
                {keyword}
              </Link>
            </>
          )}
        </span>
      </div>

      <FilteredProducts
        keyword={keyword}
        id={id}
        getProductsAction={getShopProducts}
      />
    </>
  );
};

export default GetShopProducts;
