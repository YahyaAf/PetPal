import { createContext, useContext, useMemo, useState } from "react";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem(REFRESH_TOKEN_KEY) || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem(USER_KEY)) || null);

  const setAuth = (authResponse) => {
    const nextUser = {
      id: authResponse.userId,
      email: authResponse.email,
      nom: authResponse.nom,
      role: authResponse.role,
    };

    localStorage.setItem(TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));

    setToken(authResponse.accessToken);
    setRefreshToken(authResponse.refreshToken);
    setUser(nextUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, refreshToken, user, setAuth, clearAuth }),
    [token, refreshToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
};
