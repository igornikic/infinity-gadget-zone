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

// Password reset routes
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

// Product Imports
const NewProduct = lazy(() => import("./components/product/NewProduct"));

import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Header />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
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
          {/* Product routes */}
          <Route
            path="/product/new"
            element={<ProtectedRoute isSeller={true} element={NewProduct} />}
          />
        </Routes>
        <Footer />
      </Suspense>
    </Router>
  );
};

export default App;
