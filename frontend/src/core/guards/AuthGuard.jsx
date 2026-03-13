import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useAuthContext } from "../context/AuthContext";

const AuthGuard = () => {
  const { token } = useAuthContext();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
