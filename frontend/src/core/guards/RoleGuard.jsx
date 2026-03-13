import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useAuthContext } from "../context/AuthContext";

const RoleGuard = ({ allowedRoles }) => {
  const { user } = useAuthContext();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
