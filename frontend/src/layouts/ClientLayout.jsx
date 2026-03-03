import { Outlet } from "react-router-dom";
import ClientNavbar from "../components/shared/Navbar/ClientNavbar";
import ClientFooter from "../components/shared/Footer/ClientFooter";

const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ClientNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};

export default ClientLayout;
