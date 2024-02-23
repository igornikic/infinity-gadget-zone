import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getProducts, clearErrors } from "../../features/product/productsSlice";

import Alert from "../utils/Alert";
import FilteredProducts from "./FilteredProducts";

const GetProducts = () => {
  const { keyword } = useParams();

  // Extract products state from redux store
  const { error } = useSelector((state) => state.products);

  return (
    <>
      {/* Display error message if there is an error */}
      {error && <Alert message={error} clear={clearErrors} type={"error"} />}

      {/* Render filtered products */}
      <FilteredProducts keyword={keyword} getProductsAction={getProducts} />
    </>
  );
};

export default GetProducts;
