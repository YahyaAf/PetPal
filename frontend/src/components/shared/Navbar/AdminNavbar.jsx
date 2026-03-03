import useAuth from "../../../core/hooks/useAuth";

const AdminNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <span className="text-lg font-bold text-blue-600 tracking-tight">PetPal Admin</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.nom}</span>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
