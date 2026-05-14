export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-slate-600" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1B4FD8] border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

