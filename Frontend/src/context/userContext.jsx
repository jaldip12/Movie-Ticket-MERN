import { createContext } from "react";

export const userContext = createContext({
    userInfo: {},
    setuserInfo: () => {},
    handlePing: () => Promise.resolve(false), 
    logout: () => Promise.resolve(false)
});