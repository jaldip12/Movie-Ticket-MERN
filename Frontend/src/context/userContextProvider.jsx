import { useState } from "react";
import { userContext } from "./userContext";
import axios from "axios";

// eslint-disable-next-line react/prop-types
export default function UserContextProvider({ children }) {
  const [userInfo, setuserInfo] = useState({});

  const handlePing = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/users/ping",
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
        // console.log("Not an admin");
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
    handlePingAdmin: handlePing,
    logout: handleLogout,
  };
  return (
    <userContext.Provider value={ctxvalue }>
      {children}
    </userContext.Provider>
  );
}
