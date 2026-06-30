import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.js";
import AccountsPage from "./pages/AccountsPage.js";
import IdentityDetailPage from "./pages/IdentityDetailPage.js";
import ReviewQueuePage from "./pages/ReviewQueuePage.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<AccountsPage />} />
          <Route path="identities/:id" element={<IdentityDetailPage />} />
          <Route path="review" element={<ReviewQueuePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
