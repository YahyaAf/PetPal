import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { ROLES, ROUTES } from "../utils/constants";

const GuestGuard = () => {
  const { token, user } = useAuthContext();

  if (!token) {
    return <Outlet />;
  }

  const redirectTo = user?.role === ROLES.CLIENT ? ROUTES.CLIENT_HOME : ROUTES.ADMIN_DASHBOARD;

  return <Navigate to={redirectTo} replace />;
};

export default GuestGuard;