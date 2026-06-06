import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import "./index.css";

// The central `api` axios instance in lib/api.js already sets withCredentials.
// We do NOT mutate the global axios default — that would leak cookies onto
// any bare `axios.put(uploadUrl, ...)` call to R2 / S3 / etc.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 5000,
        style: {
          background: "#363636",
          color: "#fff",
        },
      }}
    />
    <InstallPrompt />
    <App />
  </React.StrictMode>
);
