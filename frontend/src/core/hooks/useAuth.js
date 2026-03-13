import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { ROLES, ROUTES } from "../utils/constants";
import { useAuthContext } from "../context/AuthContext";

const useAuth = () => {
  const { token, user, setAuth, clearAuth } = useAuthContext();
  const navigate = useNavigate();

  const isAuthenticated = !!token;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isClient = user?.role === ROLES.CLIENT;

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setAuth(data);
    if (data.role === ROLES.ADMIN) {
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else {
      navigate(ROUTES.CLIENT_HOME);
    }
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    setAuth(data);
    navigate(ROUTES.CLIENT_HOME);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  return { token, user, isAuthenticated, isAdmin, isClient, login, register, logout };
};

export default useAuth;
