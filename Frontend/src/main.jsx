import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from 'react-hot-toast'
ReactDOM.createRoot(document.getElementById("root")).render(
 
  <React.StrictMode>
  <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerStyle={{}}
          containerClassName=""
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
    <App />
  </React.StrictMode>
  
);
