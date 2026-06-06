import React, { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const primaryBtn =
  "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-md px-4 py-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

const secondaryBtn =
  "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-lg px-4 py-2.5 transition-colors";

const R2Uploader = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    setImage(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const presign = await api.post("/uploads/presign", {
        kind: "poster",
        contentType: image.type,
        filename: image.name,
      });

      const { uploadUrl, publicUrl } = presign.data.data;

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": image.type },
        body: image,
      });

      if (!putRes.ok) {
        toast.error("Upload failed");
        setError("Upload failed. Please try again.");
        return;
      }

      setPreview(null);
      setImage(null);
      if (typeof onImageUpload === "function") {
        onImageUpload(publicUrl);
      } else {
        console.warn("onImageUpload is not a function");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to upload image. Please try again.";
      toast.error(message);
      setError(message);
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
    <div className="w-full bg-slate-50 border border-slate-200 p-5 rounded-xl">
      <div className="mb-4">
        <input
          id="hidden-input"
          type="file"
          className="hidden"
          onChange={handleImageChange}
          accept="image/png,image/jpeg,image/webp"
        />
        <label
          htmlFor="hidden-input"
          className={`cursor-pointer block w-full text-center text-sm font-medium ${secondaryBtn}`}
        >
          Choose Movie Poster
        </label>
      </div>

      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto border border-slate-200 rounded-xl"
          />
        </div>
      )}

      {error && (
        <p className="text-rose-700 text-sm mb-4 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!image || loading}
          className={`flex-1 text-sm ${primaryBtn}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900"
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
          type="button"
          onClick={handleResetClick}
          className={`flex-1 text-sm ${secondaryBtn}`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default R2Uploader;
