import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RetailerDetailPage from "./pages/RetailerDetailPage";
import RetailersPage from "./pages/RetailersPage";
import ReviewPage from "./pages/ReviewPage";
import SignupPage from "./pages/SignupPage";

document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<App />}>
            <Route index element={<DashboardPage />} />
            <Route path="retailers" element={<RetailersPage />} />
            <Route path="retailers/:id" element={<RetailerDetailPage />} />
            <Route path="review" element={<ReviewPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
