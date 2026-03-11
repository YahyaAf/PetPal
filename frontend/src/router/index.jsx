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
import AppointmentsManagementPage from "../pages/admin/AppointmentsManagementPage";
import CitiesManagementPage from "../pages/admin/CitiesManagementPage";
import HotelsManagementPage from "../pages/admin/HotelsManagementPage";
import CategoriesManagementPage from "../pages/admin/CategoriesManagementPage";
import ProductsManagementPage from "../pages/admin/ProductsManagementPage";
import TrainingTypesManagementPage from "../pages/admin/TrainingTypesManagementPage";
import AdminOrdersManagementPage from "../pages/admin/AdminOrdersManagementPage";
import AdminReservationsManagementPage from "../pages/admin/AdminReservationsManagementPage";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage";
import AdminTrainingReservationsPage from "../pages/admin/AdminTrainingReservationsPage";

import TrainingPage from "../pages/client/TrainingPage";
import TrainingBookingPage from "../pages/client/TrainingBookingPage";
import TrainingCheckoutPage from "../pages/client/TrainingCheckoutPage";
import TrainingSuccessPage from "../pages/client/TrainingSuccessPage";
import MyTrainingReservationsPage from "../pages/client/MyTrainingReservationsPage";
import MyReviewsPage from "../pages/client/MyReviewsPage";
import DresseurReservationsPage from "../pages/client/DresseurReservationsPage";

import HotelsPage from "../pages/client/HotelsPage";
import HotelBookingPage from "../pages/client/HotelBookingPage";
import HotelCheckoutPage from "../pages/client/HotelCheckoutPage";
import HotelBookingSuccessPage from "../pages/client/HotelBookingSuccessPage";
import MyReservationsPage from "../pages/client/MyReservationsPage";

import ClientHomePage from "../pages/client/ClientHomePage";
import MyPetsPage from "../pages/client/MyPetsPage";
import MyAppointmentsPage from "../pages/client/MyAppointmentsPage";
import ProfilePage from "../pages/client/ProfilePage";
import ProductsPage from "../pages/client/ProductsPage";
import ProductDetailPage from "../pages/client/ProductDetailPage";
import CartPage from "../pages/client/CartPage";
import CheckoutPage from "../pages/client/CheckoutPage";
import OrderSuccessPage from "../pages/client/OrderSuccessPage";
import MyOrdersPage from "../pages/client/MyOrdersPage";

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
        element: <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.DRESSEUR]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "/dashboard", element: <AdminDashboardPage /> },
              { path: "/dashboard/users", element: <UsersManagementPage /> },
              { path: "/dashboard/clients", element: <ClientsManagementPage /> },
              { path: "/dashboard/appointments", element: <AppointmentsManagementPage /> },
              { path: "/dashboard/cities", element: <CitiesManagementPage /> },
              { path: "/dashboard/hotels", element: <HotelsManagementPage /> },
              { path: "/dashboard/categories", element: <CategoriesManagementPage /> },
              { path: "/dashboard/products", element: <ProductsManagementPage /> },
              { path: "/dashboard/training-types", element: <TrainingTypesManagementPage /> },
              { path: "/dashboard/orders", element: <AdminOrdersManagementPage /> },
              { path: "/dashboard/reservations", element: <AdminReservationsManagementPage /> },
              { path: "/dashboard/training-reservations", element: <AdminTrainingReservationsPage /> },
              { path: "/dashboard/my-sessions", element: <DresseurReservationsPage /> },
              { path: "/dashboard/reviews", element: <AdminReviewsPage /> },
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
              { path: "/checkout", element: <CheckoutPage /> },
              { path: "/order/success", element: <OrderSuccessPage /> },
              { path: "/orders", element: <MyOrdersPage /> },
              { path: "/hotels", element: <HotelsPage /> },
              { path: "/hotels/:id/book", element: <HotelBookingPage /> },
              { path: "/hotel-checkout", element: <HotelCheckoutPage /> },
              { path: "/hotel-booking/success", element: <HotelBookingSuccessPage /> },
              { path: "/my-reservations", element: <MyReservationsPage /> },
              { path: "/training", element: <TrainingPage /> },
              { path: "/training/:id/book", element: <TrainingBookingPage /> },
              { path: "/training-checkout", element: <TrainingCheckoutPage /> },
              { path: "/training/success", element: <TrainingSuccessPage /> },
              { path: "/my-training-reservations", element: <MyTrainingReservationsPage /> },
              { path: "/my-reviews", element: <MyReviewsPage /> },
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
