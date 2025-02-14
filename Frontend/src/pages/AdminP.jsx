import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedAdminRoute() {
  const isAuthenticated = localStorage.getItem("adminToken");

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
}
