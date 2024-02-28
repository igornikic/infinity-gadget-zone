import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout Imports
import Header from "./components/layout/Header";
const Home = lazy(() => import("./components/layout/Home"));
import Footer from "./components/layout/Footer";
import Loader from "./components/layout/Loader";

// Authentication/User Imports
const Register = lazy(() => import("./components/user/Register"));
const Login = lazy(() => import("./components/user/Login"));
const Profile = lazy(() => import("./components/user/Profile"));
const UpdateProfile = lazy(() => import("./components/user/UpdateProfile"));
const UpdatePassword = lazy(() => import("./components/user/UpdatePassword"));

// Password reset Imports
const ForgotPassword = lazy(() =>
  import("./components/forgotPassword/ForgotPassword")
);
const NewPassword = lazy(() =>
  import("./components/forgotPassword/NewPassword")
);

// Shop Imports
const NewShop = lazy(() => import("./components/shop/NewShop"));
const ActivateShop = lazy(() => import("./components/shop/ActivateShop"));
const LoginShop = lazy(() => import("./components/shop/LoginShop"));
const ShopInfo = lazy(() => import("./components/shop/ShopInfo"));
const ShopProfile = lazy(() => import("./components/shop/ShopProfile"));
const UpdateShop = lazy(() => import("./components/shop/UpdateShop"));

// Product Imports
const NewProduct = lazy(() => import("./components/product/NewProduct"));
const GetProducts = lazy(() => import("./components/product/GetProducts"));
const ProductDetails = lazy(() =>
  import("./components/product/ProductDetails")
);
const GetShopProducts = lazy(() =>
  import("./components/product/GetShopProducts")
);

// Cart Imports
const Cart = lazy(() => import("./components/cart/Cart"));
const Shipping = lazy(() => import("./components/cart/Shipping"));

// Privacy Imports
const PrivacyPolicy = lazy(() => import("./components/privacy/PrivacyPolicy"));
const CookieConsent = lazy(() => import("./components/privacy/CookieConsent"));

import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Header />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:keyword" element={<GetProducts />} />
          {/* Authentication/User routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<ProtectedRoute element={Profile} />} />
          <Route
            path="/me/update"
            element={<ProtectedRoute element={UpdateProfile} />}
          />
          <Route
            path="/password/update"
            element={<ProtectedRoute element={UpdatePassword} />}
          />
          {/* Password reset routes */}
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<NewPassword />} />
          {/* Shop routes */}
          <Route path="/shop/new" element={<NewShop />} />
          <Route path="/shop/activate/:token" element={<ActivateShop />} />
          <Route path="/shop/login" element={<LoginShop />} />
          <Route path="/shop/password/forgot" element={<ForgotPassword />} />
          <Route path="/shop/info/:id" element={<ShopInfo />} />
          <Route
            path="/shop/me"
            element={<ProtectedRoute isSeller={true} element={ShopProfile} />}
          />
          <Route
            path="/shop/me/update"
            element={<ProtectedRoute isSeller={true} element={UpdateShop} />}
          />
          {/* Product routes */}
          <Route
            path="/product/new"
            element={<ProtectedRoute isSeller={true} element={NewProduct} />}
          />
          <Route path="/products/shop/:id" element={<GetShopProducts />} />
          <Route
            path="/products/shop/:id/:keyword"
            element={<GetShopProducts />}
          />
          {/* Cart routes */}
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/shipping"
            element={<ProtectedRoute element={Shipping} />}
          />

          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
        <CookieConsent />
        <Footer />
      </Suspense>
    </Router>
  );
};

export default App;
