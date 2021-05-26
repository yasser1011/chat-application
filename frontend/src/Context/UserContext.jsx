import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../apiUrl";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [userData, setUserData] = useState({ user: null, token: null });
  const [userLoading, setUserLoading] = useState(true);

  const fetchUser = async () => {
    let token = localStorage.getItem("auth-token");
    if (token === null) {
      //to pass the undefined error
      localStorage.setItem("auth-token", "");
      token = "";
    }
    try {
      const tokenRes = await axios.post(`${apiUrl}/users/tokenIsValid`, null, {
        headers: { "x-auth-token": token },
      });
      console.log(tokenRes.data);
      if (tokenRes.data) {
        const userRes = await axios.get(`${apiUrl}/users/getUser`, {
          headers: { "x-auth-token": token },
        });

        setUserData({
          token: token,
          user: userRes.data.user,
        });

        setUserLoading(false);
      }
      setUserLoading(false);
    } catch (err) {
      setUserLoading(false);
      console.log(err.response.data.error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, userLoading }}>
      {props.children}
    </UserContext.Provider>
  );
};
