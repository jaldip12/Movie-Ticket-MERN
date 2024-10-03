import React, { useState, useCallback } from "react";
import { Cloudinary } from "@cloudinary/url-gen";

const ImageUpload = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const cloudinary = new Cloudinary({
    cloud: { cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME },
  });

  const handleImageChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5000000) {
        setError("File is too large. Maximum size is 5MB.");
        return;
      }
      setImage(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file.");
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", image);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", "Movie-Posters");
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Upload failed");
      const { secure_url } = await response.json();
      setPreview(null);
      if (typeof onImageUpload === "function") onImageUpload(secure_url);
      else console.warn("onImageUpload is not a function");
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [image, onImageUpload]);

  const handleResetClick = useCallback(() => {
    setPreview(null);
    setImage(null);
    setError(null);
    if (typeof onImageUpload === "function") onImageUpload(null);
    else console.warn("onImageUpload is not a function");
  }, [onImageUpload]);

  return (
    <div className="w-full bg-gray-800 p-6 rounded-lg shadow-xl">
      <div className="mb-6">
        <input
          id="hidden-input"
          type="file"
          className="hidden"
          onChange={handleImageChange}
          accept="image/*"
        />
        <label
          htmlFor="hidden-input"
          className="cursor-pointer block w-full text-center py-3 px-4 border border-yellow-500 rounded-md shadow-sm text-sm font-medium text-yellow-500 bg-transparent hover:bg-yellow-500 hover:text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          Choose Movie Poster
        </label>
      </div>
      {preview && (
        <div className="mb-6">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg shadow-md border-2 border-yellow-500"
          />
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">
          {error}
        </p>
      )}
      <div className="flex justify-between space-x-4">
        <button
          onClick={handleUpload}
          disabled={!image || loading}
          className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload Poster"
          )}
        </button>
        <button
          onClick={handleResetClick}
          className="flex-1 py-3 px-4 border border-yellow-500 text-sm font-medium rounded-md shadow-sm text-yellow-500 bg-transparent hover:bg-yellow-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
