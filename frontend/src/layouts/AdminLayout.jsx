import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/shared/Navbar/AdminNavbar";
import AdminSidebar from "../components/shared/Sidebar/AdminSidebar";

const AdminLayout = () => {
  const [dark, setDark] = useState(() => localStorage.getItem("petpal-theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("petpal-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("petpal-theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminNavbar dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
