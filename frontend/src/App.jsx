import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout Imports
import Header from "./components/layout/Header";
const Home = lazy(() => import("./components/layout/Home"));
import Footer from "./components/layout/Footer";
import Loader from "./components/layout/Loader";

// Authentication Imports
const Register = lazy(() => import("./components/user/Register"));

// import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Header />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Authentication routes */}
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
      </Suspense>
    </Router>
  );
};

export default App;
