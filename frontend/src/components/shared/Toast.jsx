import useToastStore from "../../store/toastStore";

const STYLES = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

const ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm shadow-lg min-w-[260px] max-w-sm ${STYLES[toast.type] || STYLES.success}`}
        >
          <span className="font-bold text-base leading-none">{ICONS[toast.type] || ICONS.success}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
