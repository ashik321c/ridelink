import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import App from "./App";
import StandaloneAdPage from "./pages/AdPage";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/ad" element={<StandaloneAdPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
