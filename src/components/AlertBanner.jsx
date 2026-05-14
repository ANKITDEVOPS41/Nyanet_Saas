import { X } from "lucide-react";

const styles = {
  danger: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export default function AlertBanner({ message, type = "info", onDismiss }) {
  if (!message) return null;

  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${styles[type] || styles.info}`}>
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss alert"
          className="rounded-md p-1 transition hover:bg-black/5"
          onClick={onDismiss}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

