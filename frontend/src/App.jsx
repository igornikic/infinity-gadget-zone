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
const ForgotPassword = lazy(() => import("./components/user/ForgotPassword"));
const NewPassword = lazy(() => import("./components/user/NewPassword"));

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
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<NewPassword />} />
          <Route
            path="/me/update"
            element={<ProtectedRoute element={UpdateProfile} />}
          />
          <Route
            path="/password/update"
            element={<ProtectedRoute element={UpdatePassword} />}
          />
        </Routes>
        <Footer />
      </Suspense>
    </Router>
  );
};

export default App;
