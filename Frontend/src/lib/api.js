import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
