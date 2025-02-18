import { useState } from "react";
import { userContext } from "./userContext";
import axios from "axios";

export default function UserContextProvider({ children }) {
  const [userInfo, setuserInfo] = useState({});

  const handlePingAdmin = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/user/ping",
        {
          withCredentials: true,
        }
      );

      if (response.data.statusCode === 200) {
        setuserInfo(response.data.data);
        return true;
      }
      else{
        console.log(response.data);
      }
      return false;
    } catch (error) {
      console.error("Ping failed:", error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setuserInfo({});
        return true;
      }
      return false;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  };

  const ctxvalue = {
    userInfo: userInfo,
    setuserInfo: setuserInfo,
    handlePingAdmin: handlePingAdmin,
    logout: handleLogout,
  };
  return (
    <userContext.Provider value={ctxvalue }>
      {children}
    </userContext.Provider>
  );
}
