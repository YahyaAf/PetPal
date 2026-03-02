import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import ClientLayout from "../layouts/ClientLayout";
import AuthGuard from "../core/guards/AuthGuard";
import RoleGuard from "../core/guards/RoleGuard";
import { ROLES } from "../core/utils/constants";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UsersManagementPage from "../pages/admin/UsersManagementPage";
import PetsManagementPage from "../pages/admin/PetsManagementPage";
import AppointmentsManagementPage from "../pages/admin/AppointmentsManagementPage";

import ClientHomePage from "../pages/client/ClientHomePage";
import MyPetsPage from "../pages/client/MyPetsPage";
import MyAppointmentsPage from "../pages/client/MyAppointmentsPage";
import ProfilePage from "../pages/client/ProfilePage";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/auth/login", element: <LoginPage /> },
      { path: "/auth/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "/admin/dashboard", element: <AdminDashboardPage /> },
              { path: "/admin/users", element: <UsersManagementPage /> },
              { path: "/admin/pets", element: <PetsManagementPage /> },
              { path: "/admin/appointments", element: <AppointmentsManagementPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleGuard allowedRoles={[ROLES.CLIENT]} />,
        children: [
          {
            element: <ClientLayout />,
            children: [
              { path: "/client/home", element: <ClientHomePage /> },
              { path: "/client/pets", element: <MyPetsPage /> },
              { path: "/client/appointments", element: <MyAppointmentsPage /> },
              { path: "/client/profile", element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "/", element: <LoginPage /> },
  { path: "*", element: <LoginPage /> },
]);

export default router;
