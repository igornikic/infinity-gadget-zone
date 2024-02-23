import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  getShopProducts,
  clearErrors,
} from "../../features/product/productsSlice";

import Alert from "../utils/Alert";

import FilteredProducts from "./FilteredProducts";

const GetShopProducts = () => {
  const { id, keyword } = useParams();

  // Extract products state from redux store
  const { error } = useSelector((state) => state.products);

  return (
    <>
      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      <FilteredProducts
        keyword={keyword}
        id={id}
        getProductsAction={getShopProducts}
      />
    </>
  );
};

export default GetShopProducts;
