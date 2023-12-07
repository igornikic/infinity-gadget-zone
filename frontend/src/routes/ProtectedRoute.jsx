import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ isAdmin, isSeller, element: Element, ...rest }) => {
  // Get auth state from redux store
  const {
    isAuthenticated,
    loading: loadingAuth,
    user,
  } = useSelector((state) => state.auth);
  // Get shopAuth state from redux store
  const { loading: loadingShop, shop } = useSelector((state) => state.shopAuth);

  // Renders loading component if authentication state is still loading
  if (loadingAuth || loadingShop) {
    return null;
  }

  // Navigate to home page if user is not an admin and route requires admin role
  if (isAdmin && (!user || user.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  // Navigate to login shop page if user is not seller and route requires seller role
  if (isSeller && (!shop || shop.role !== "seller")) {
    return <Navigate to="/shop/login" replace />;
  }

  // Navigate to login page if user is not authenticated
  if (!isAuthenticated && !isSeller && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Element {...rest} />;
};

export default ProtectedRoute;
