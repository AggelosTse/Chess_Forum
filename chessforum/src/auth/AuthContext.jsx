import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

//token manager
export function AuthProvider({ children }) {

    const getSecureItem = (key) => {
    const value = localStorage.getItem(key);
    if(value === "null" || value === "undefined") return null;
    else return value;
    };

  const [token, setToken] = useState(() => getSecureItem("token"));
  const [role, setRole] = useState(() => getSecureItem("role"));
  const [username, setUsername] = useState(() => getSecureItem("username"));

  //store user info in localstorage 
  const login = (newToken, role, username) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setToken(newToken);
    setRole(role);
    setUsername(username);
  };

  //remove user info when logs out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, role,username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

//useAuth returns user info
export function useAuth() {
  return useContext(AuthContext);
}