import useAuth from "../../../core/hooks/useAuth";

const AdminNavbar = ({ dark, onToggleDark }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 transition-colors">
      {/* Spacer (logo lives in sidebar) */}
      <div className="w-8" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 w-64">
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher…"
          className="bg-transparent text-xs text-gray-600 dark:text-gray-300 outline-none placeholder-gray-400 w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          title={dark ? "Mode clair" : "Mode sombre"}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
              {user?.nom?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">{user?.nom}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
