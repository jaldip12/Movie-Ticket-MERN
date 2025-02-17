import { createContext } from "react";

export const AdminContext = createContext({
    admininfo: {},
    setAdmininfo: () => {},
    handlePingAdmin: () => Promise.resolve(false), 
    handleLogout: () => Promise.resolve(false)
});