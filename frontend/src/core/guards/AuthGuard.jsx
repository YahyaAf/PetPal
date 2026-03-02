import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { ROUTES } from "../utils/constants";

const AuthGuard = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
