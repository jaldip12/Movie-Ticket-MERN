import { createContext } from "react";

export const userContext = createContext({
    userInfo: {},
    setuserInfo: () => {},
    handlePingAdmin: () => Promise.resolve(false), 
    logout: () => Promise.resolve(false)
});