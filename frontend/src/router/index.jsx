import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import ClientLayout from "../layouts/ClientLayout";
import AuthGuard from "../core/guards/AuthGuard";
import RoleGuard from "../core/guards/RoleGuard";
import { ROLES } from "../core/utils/constants";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import ClientsManagementPage from "../pages/admin/ClientsManagementPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UsersManagementPage from "../pages/admin/UsersManagementPage";
import PetsManagementPage from "../pages/admin/PetsManagementPage";
import AppointmentsManagementPage from "../pages/admin/AppointmentsManagementPage";
import CitiesManagementPage from "../pages/admin/CitiesManagementPage";
import HotelsManagementPage from "../pages/admin/HotelsManagementPage";
import CategoriesManagementPage from "../pages/admin/CategoriesManagementPage";
import ProductsManagementPage from "../pages/admin/ProductsManagementPage";
import TrainingTypesManagementPage from "../pages/admin/TrainingTypesManagementPage";

import ClientHomePage from "../pages/client/ClientHomePage";
import MyPetsPage from "../pages/client/MyPetsPage";
import MyAppointmentsPage from "../pages/client/MyAppointmentsPage";
import ProfilePage from "../pages/client/ProfilePage";
import ProductsPage from "../pages/client/ProductsPage";
import ProductDetailPage from "../pages/client/ProductDetailPage";
import CartPage from "../pages/client/CartPage";

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
              { path: "/dashboard", element: <AdminDashboardPage /> },
              { path: "/dashboard/users", element: <UsersManagementPage /> },
              { path: "/dashboard/clients", element: <ClientsManagementPage /> },
              { path: "/dashboard/pets", element: <PetsManagementPage /> },
              { path: "/dashboard/appointments", element: <AppointmentsManagementPage /> },
              { path: "/dashboard/cities", element: <CitiesManagementPage /> },
              { path: "/dashboard/hotels", element: <HotelsManagementPage /> },
              { path: "/dashboard/categories", element: <CategoriesManagementPage /> },
              { path: "/dashboard/products", element: <ProductsManagementPage /> },
              { path: "/dashboard/training-types", element: <TrainingTypesManagementPage /> },
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
              { path: "/", element: <ClientHomePage /> },
              { path: "/products", element: <ProductsPage /> },
              { path: "/products/:id", element: <ProductDetailPage /> },
              { path: "/cart", element: <CartPage /> },
              { path: "/pets", element: <MyPetsPage /> },
              { path: "/appointments", element: <MyAppointmentsPage /> },
              { path: "/profile", element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <LoginPage /> },
]);

export default router;
