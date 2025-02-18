import { useEffect, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";

export default function AdminLayout() {
  const { handlePingAdmin } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const isAdmin = await handlePingAdmin();
      if (!isAdmin) {
        navigate("/auth/login"); // Redirect to login if not an admin
      }
    };
    checkAdminStatus();
  }, [handlePingAdmin, navigate]);

  return <Outlet />;
}
