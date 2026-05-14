import { getStockStatus, stockStatusColor, stockTextColor } from "../utils/anomalyDetector";

export default function StockBar({ label, current, max, unit }) {
  const percent = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  const status = getStockStatus(current, max);

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-900">{label}</span>
        <span className={`font-bold ${stockTextColor(status)}`}>
          {current}/{max} {unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${stockStatusColor(status)}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{percent}% available</span>
        <span className="capitalize">{status === "red" ? "critical" : status}</span>
      </div>
    </div>
  );
}

