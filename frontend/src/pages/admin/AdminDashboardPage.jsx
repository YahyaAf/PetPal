import { useState, useEffect } from "react";
import userService from "../../services/userService";
import clientService from "../../services/clientService";

const StatCard = ({ label, value, loading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    {loading ? (
      <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
    ) : (
      <p className="text-3xl font-bold text-gray-800">{value ?? "—"}</p>
    )}
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ users: null, clients: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, clients] = await Promise.all([
          userService.count(),
          clientService.count(),
        ]);
        setStats({ users, clients });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Utilisateurs" value={stats.users} loading={loading} />
        <StatCard label="Clients" value={stats.clients} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
