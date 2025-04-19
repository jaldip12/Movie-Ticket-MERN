import { useEffect } from "react";
import { Outlet } from "react-router-dom";
// import { userContext } from "../../context/userContext";

export default function AdminLayout() {
  
  

  useEffect(() => {
    const checkAdminStatus = async () => {
      
    
    };
    checkAdminStatus();
  }, []);

  return <Outlet />;
}
