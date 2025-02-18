import { useState } from "react";
import { AdminContext } from "./AdminContext";
import axios from "axios";

export default function AdminContextProvider({ children }) {
    const [admininfo, setAdmininfo] = useState({});

    const handlePingAdmin = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/v1/user/ping", {
                withCredentials: true
                
            });
            
            if (response.data.statusCode === 200) {
                setAdmininfo(response.data.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ping failed:', error);
            return false;
        }
    };

    const handleLogout = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/v1/user/logout", {
                withCredentials: true
            });
            if (response.status === 200) {
                setAdmininfo({});
                localStorage.removeItem('adminToken');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    };

    const ctxvalue={
        admininfo:admininfo,
        setAdmininfo:setAdmininfo,
        handlePingAdmin:handlePingAdmin,
        handleLogout:handleLogout
    }
    return (
        <AdminContext.Provider value={{
            ctxvalue
        }}>
            {children}
        </AdminContext.Provider>
    );
}