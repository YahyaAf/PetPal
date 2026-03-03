import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/shared/Navbar/AdminNavbar";
import AdminSidebar from "../components/shared/Sidebar/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
