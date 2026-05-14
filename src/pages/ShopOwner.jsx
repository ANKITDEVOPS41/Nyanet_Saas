import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BellRing, Bot, CheckCircle2, PackagePlus, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlertBanner from "../components/AlertBanner";
import StockBar from "../components/StockBar";
import { askGemini } from "../gemini";
import { useFirestore } from "../hooks/useFirestore";
import { getStockStatus } from "../utils/anomalyDetector";

const stock = [
  { label: "Rice", current: 34, max: 100, unit: "kg" },
  { label: "Wheat", current: 12, max: 80, unit: "kg" },
  { label: "Oil", current: 8, max: 40, unit: "L" },
  { label: "Sugar", current: 22, max: 50, unit: "kg" },
];

const predictionPrompt = `You are an AI assistant for a government ration shop in India.
Current stock: Rice: 34kg, Wheat: 12kg, Oil: 8L, Sugar: 22kg.
Total beneficiaries this month: 200. Collected so far: 112.
Remaining: 88 beneficiaries.
Average consumption per family: Rice 5kg, Wheat 2kg, Oil 1L, Sugar 0.5kg.

Predict: Will stock run out before all beneficiaries are served?
Give a 3-bullet recommendation for what to reorder and how urgently.
Keep response under 60 words. Be specific and urgent where needed.`;

function Metric({ label, value, tone }) {
  const tones = {
    blue: "bg-blue-50 text-[#1B4FD8]",
    amber: "bg-amber-50 text-[#D97706]",
    red: "bg-red-50 text-[#DC2626]",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`mt-2 w-fit rounded-lg px-3 py-1 text-3xl font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default function ShopOwner() {
  const [prediction, setPrediction] = useState("");
  const [predictionError, setPredictionError] = useState("");
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [warningVisible, setWarningVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [item, setItem] = useState("Wheat");
  const [quantity, setQuantity] = useState("176");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { addAlert } = useFirestore();

  const hasCriticalStock = useMemo(() => stock.some((item) => getStockStatus(item.current, item.max) === "red"), []);

  async function loadPrediction() {
    setLoadingPrediction(true);
    setPredictionError("");

    try {
      const response = await askGemini(predictionPrompt);
      setPrediction(response);
    } catch {
      setPredictionError("AI prediction could not load. Please try refreshing.");
    } finally {
      setLoadingPrediction(false);
    }
  }

  useEffect(() => {
    loadPrediction();
  }, []);

  async function submitResupply(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await addAlert({
        type: "resupply_request",
        shopId: "S001",
        shopName: "Khordha Ward 12",
        item,
        quantity: Number(quantity),
        status: "open",
        priority: item === "Wheat" ? "critical" : "normal",
      });
      setToast(`Resupply request sent for ${quantity} ${item}.`);
      setModalOpen(false);
    } catch {
      setToast("Could not send to Firestore. Request saved locally in demo mode.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#16A34A]">Shop owner console</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Khordha Ward 12 — PDS Shop</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Live stock health, AI reorder urgency, and one-tap beneficiary verification for distribution hours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/beneficiary")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B4FD8] px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <ShieldCheck size={18} /> Quick Verify <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {toast && <AlertBanner message={toast} type="info" onDismiss={() => setToast("")} />}
          {hasCriticalStock && warningVisible && (
            <AlertBanner
              message="Wheat stock is critical and may run out before remaining beneficiaries are served."
              type="danger"
              onDismiss={() => setWarningVisible(false)}
            />
          )}
        </div>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">A. Live Stock Dashboard</h2>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase text-[#16A34A]">Live</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stock.map((item) => (
              <StockBar key={item.label} {...item} />
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="text-purple-700" size={23} />
                <h2 className="text-xl font-black text-slate-950">B. AI Prediction</h2>
              </div>
              <button
                type="button"
                onClick={loadPrediction}
                disabled={loadingPrediction}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw size={16} className={loadingPrediction ? "animate-spin" : ""} /> Refresh Prediction
              </button>
            </div>

            {loadingPrediction ? (
              <div className="space-y-3">
                <div className="skeleton h-5 w-11/12 rounded" />
                <div className="skeleton h-5 w-10/12 rounded" />
                <div className="skeleton h-5 w-8/12 rounded" />
              </div>
            ) : predictionError ? (
              <AlertBanner message={predictionError} type="warning" onDismiss={() => setPredictionError("")} />
            ) : (
              <div className="rounded-lg bg-purple-50 p-4 text-sm font-semibold leading-7 whitespace-pre-line text-purple-950">{prediction}</div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Metric label="Verified today" value="34" tone="blue" />
            <Metric label="Pending this month" value="88" tone="amber" />
            <Metric label="Alerts" value="1" tone="red" />
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">D. Resupply Actions</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Create a Firestore alert for officer approval and district logistics.</p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-3 text-sm font-black text-white transition hover:bg-green-700"
            >
              <PackagePlus size={18} /> Request Resupply
            </button>
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <form onSubmit={submitResupply} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing size={22} className="text-[#D97706]" />
                <h3 className="text-xl font-black text-slate-950">Request resupply</h3>
              </div>
              <button type="button" aria-label="Close modal" onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <label className="block text-sm font-bold text-slate-700" htmlFor="item">
              Item
            </label>
            <select
              id="item"
              value={item}
              onChange={(event) => setItem(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#16A34A]"
            >
              <option>Rice</option>
              <option>Wheat</option>
              <option>Oil</option>
              <option>Sugar</option>
            </select>

            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#16A34A]"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle2 size={18} /> {submitting ? "Sending..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
