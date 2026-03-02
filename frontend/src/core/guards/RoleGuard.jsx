import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { ROUTES } from "../utils/constants";

const RoleGuard = ({ allowedRoles }) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
