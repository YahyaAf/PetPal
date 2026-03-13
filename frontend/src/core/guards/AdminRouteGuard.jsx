import { useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { ROLES, ROUTES } from "../utils/constants";

// Role-based allowed routes mapping
const ADMIN_ROUTES = new Set([
  "/dashboard",
  "/dashboard/users",
  "/dashboard/clients",
  "/dashboard/appointments",
  "/dashboard/hotels",
  "/dashboard/training-types",
  "/dashboard/cities",
  "/dashboard/categories",
  "/dashboard/products",
  "/dashboard/orders",
  "/dashboard/reservations",
  "/dashboard/training-reservations",
  "/dashboard/reviews",
]);

const DRESSEUR_ROUTES = new Set([
  "/dashboard",
  "/dashboard/my-sessions",
]);

const VET_ROUTES = new Set([
  "/dashboard",
  "/dashboard/appointments",
]);

const getRoutesByRole = (role) => {
  switch (role) {
    case ROLES.DRESSEUR:
      return DRESSEUR_ROUTES;
    case ROLES.VET:
      return VET_ROUTES;
    case ROLES.ADMIN:
      return ADMIN_ROUTES;
    default:
      return new Set();
  }
};

const AdminRouteGuard = () => {
  const { user } = useAuthContext();
  const { pathname } = useLocation();

  // Get allowed routes for user's role
  const allowedRoutes = getRoutesByRole(user?.role);

  // Check if current path is allowed
  const isAllowed = allowedRoutes.has(pathname);

  if (!isAllowed) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default AdminRouteGuard;
