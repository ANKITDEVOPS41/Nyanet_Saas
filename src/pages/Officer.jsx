import { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useLoadScript } from "@react-google-maps/api";
import { AlertTriangle, Bot, CheckCircle2, MapPin, PackagePlus, RefreshCw, Search, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AlertBanner from "../components/AlertBanner";
import { askGemini } from "../gemini";
import { useFirestore } from "../hooks/useFirestore";
import { calculateDistrictStats } from "../utils/anomalyDetector";
import { mockShops } from "../utils/mockData";

const briefingPrompt = `You are an AI assistant for a district welfare officer in Odisha, India.
Here is today's data for 10 ration shops:
- 4 shops healthy (stock > 50%)
- 3 shops low stock (20-50%)  
- 3 shops critical (stock < 20%): Puri Gate, Jatni Block, Mancheswar
- 1 fraud anomaly detected at Puri Gate Shop
- Total beneficiaries served today: 887 / 1735 (51%)

Give a 3-bullet executive briefing on what the officer must do TODAY.
Be specific. Name the shops. Under 80 words total.`;

const statusColors = {
  green: "#16A34A",
  yellow: "#D97706",
  red: "#DC2626",
};

function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

function MapFallback({ onSelect }) {
  return (
    <div className="grid min-h-[420px] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-3">
      {mockShops.map((shop) => (
        <button
          key={shop.id}
          type="button"
          onClick={() => onSelect(shop)}
          className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">{shop.name}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{shop.id} · Odisha</p>
            </div>
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColors[shop.status] }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-600">Rice {shop.rice}kg · Wheat {shop.wheat}kg · Oil {shop.oil}L</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">Served today: {shop.served}/{shop.total}</p>
        </button>
      ))}
    </div>
  );
}

function MapsDashboard({ selectedShop, onSelect, onSendResupply }) {
  const mapsKey = import.meta.env.VITE_MAPS_KEY;

  if (!mapsKey) {
    return <MapFallback onSelect={onSelect} />;
  }

  return <LoadedGoogleMap mapsKey={mapsKey} selectedShop={selectedShop} onSelect={onSelect} onSendResupply={onSendResupply} />;
}

function LoadedGoogleMap({ mapsKey, selectedShop, onSelect, onSendResupply }) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: mapsKey });
  const center = { lat: 20.2709, lng: 85.8126 };

  if (loadError) return <AlertBanner message="Google Maps could not load. Check VITE_MAPS_KEY and billing status." type="warning" />;
  if (!isLoaded) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="skeleton h-[420px] rounded-lg" />
      </div>
    );
  }

  return (
    <GoogleMap
      center={center}
      zoom={11}
      mapContainerClassName="h-[460px] w-full rounded-lg border border-slate-200"
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      }}
    >
      {mockShops.map((shop) => (
        <MarkerF
          key={shop.id}
          position={{ lat: shop.lat, lng: shop.lng }}
          onClick={() => onSelect(shop)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: statusColors[shop.status],
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }}
        />
      ))}

      {selectedShop && (
        <InfoWindowF position={{ lat: selectedShop.lat, lng: selectedShop.lng }} onCloseClick={() => onSelect(null)}>
          <div className="max-w-56 p-1">
            <p className="font-black text-slate-950">{selectedShop.name}</p>
            <p className="mt-2 text-sm text-slate-700">
              Rice {selectedShop.rice}kg / Wheat {selectedShop.wheat}kg / Oil {selectedShop.oil}L
            </p>
            <p className="mt-1 text-sm text-slate-700">Served today: {selectedShop.served}</p>
            <button
              type="button"
              onClick={() => onSendResupply(selectedShop)}
              className="mt-3 rounded-md bg-[#1B4FD8] px-3 py-2 text-xs font-black text-white"
            >
              Send Resupply
            </button>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}

export default function Officer() {
  const [alerts, setAlerts] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [anomalyVisible, setAnomalyVisible] = useState(true);
  const [investigateOpen, setInvestigateOpen] = useState(false);
  const [briefing, setBriefing] = useState("");
  const [briefingError, setBriefingError] = useState("");
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [toast, setToast] = useState("");
  const { subscribeAlerts, addAlert } = useFirestore();
  const stats = useMemo(() => calculateDistrictStats(mockShops), []);
  const chartData = [
    { name: "Healthy", shops: stats.healthy },
    { name: "Low", shops: mockShops.filter((shop) => shop.status === "yellow").length },
    { name: "Critical", shops: stats.critical },
  ];

  useEffect(() => subscribeAlerts(setAlerts), [subscribeAlerts]);

  async function loadBriefing() {
    setLoadingBriefing(true);
    setBriefingError("");
    try {
      const response = await askGemini(briefingPrompt);
      setBriefing(response);
    } catch {
      setBriefingError("AI briefing is unavailable right now. Please regenerate.");
    } finally {
      setLoadingBriefing(false);
    }
  }

  useEffect(() => {
    loadBriefing();
  }, []);

  async function sendResupply(shop) {
    if (!shop) return;
    try {
      await addAlert({
        type: "resupply_request",
        shopId: shop.id,
        shopName: shop.name,
        item: shop.status === "red" ? "All critical commodities" : "Buffer stock",
        quantity: shop.status === "red" ? 250 : 100,
        status: "open",
        priority: shop.status === "red" ? "critical" : "normal",
      });
      setToast(`Resupply alert sent for ${shop.name}.`);
    } catch {
      setToast("Resupply alert saved locally in demo mode.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-purple-700">District officer command center</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Odisha welfare allocation dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Watch stock risk, anomaly signals, and resupply actions across ration shops in real time.
            </p>
          </div>
          <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-800">
            Alerts in Firestore: {alerts.length}
          </div>
        </div>

        {toast && <div className="mb-4"><AlertBanner message={toast} type="info" onDismiss={() => setToast("")} /></div>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Shops" value="10" accent="text-slate-950" />
          <MetricCard label="Healthy" value={stats.healthy} accent="text-[#16A34A]" />
          <MetricCard label="Needs Help" value={stats.needsHelp} accent="text-[#D97706]" />
          <MetricCard label="Alerts Today" value={alerts.length + 1} accent="text-[#DC2626]" />
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">B. Google Maps Dashboard</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Green, yellow, and red markers show shop stock health.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
              <span className="h-3 w-3 rounded-full bg-[#16A34A]" /> Green
              <span className="h-3 w-3 rounded-full bg-[#D97706]" /> Yellow
              <span className="h-3 w-3 rounded-full bg-[#DC2626]" /> Red
            </div>
          </div>
          <MapsDashboard selectedShop={selectedShop} onSelect={setSelectedShop} onSendResupply={sendResupply} />
          {!import.meta.env.VITE_MAPS_KEY && (
            <div className="mt-3">
              <AlertBanner message="Google Maps key not configured. Showing an interactive demo map list instead." type="info" />
            </div>
          )}
          {selectedShop && !import.meta.env.VITE_MAPS_KEY && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-lg font-black text-slate-950">{selectedShop.name}</p>
                  <p className="text-sm font-semibold text-slate-600">
                    Rice {selectedShop.rice}kg · Wheat {selectedShop.wheat}kg · Oil {selectedShop.oil}L · Served {selectedShop.served}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => sendResupply(selectedShop)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B4FD8] px-4 py-2.5 text-sm font-black text-white"
                >
                  <PackagePlus size={17} /> Send Resupply
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            {anomalyVisible && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-950 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={25} className="mt-0.5 text-[#DC2626]" />
                  <div className="flex-1">
                    <h2 className="text-xl font-black">C. Live Anomaly Alert</h2>
                    <p className="mt-2 text-sm font-bold leading-6">Shop S003 Puri Gate — 156/160 collections in 2 hours. Possible fraud.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setInvestigateOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-black text-white">
                        <Search size={17} /> Investigate
                      </button>
                      <button type="button" onClick={() => setAnomalyVisible(false)} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Stock Risk Mix</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="shops" fill="#1B4FD8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot size={23} className="text-purple-700" />
                <h2 className="text-xl font-black text-slate-950">D. AI Briefing</h2>
              </div>
              <button
                type="button"
                onClick={loadBriefing}
                disabled={loadingBriefing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw size={16} className={loadingBriefing ? "animate-spin" : ""} /> Regenerate
              </button>
            </div>

            {loadingBriefing ? (
              <div className="space-y-3">
                <div className="skeleton h-5 w-11/12 rounded" />
                <div className="skeleton h-5 w-10/12 rounded" />
                <div className="skeleton h-5 w-8/12 rounded" />
              </div>
            ) : briefingError ? (
              <AlertBanner message={briefingError} type="warning" onDismiss={() => setBriefingError("")} />
            ) : (
              <div className="rounded-lg bg-purple-50 p-4 text-sm font-semibold leading-7 whitespace-pre-line text-purple-950">{briefing}</div>
            )}

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <CheckCircle2 size={18} className="text-[#16A34A]" /> Served today
              </div>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {stats.served} / {stats.total}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">51% district progress</p>
            </div>
          </section>
        </div>
      </div>

      {investigateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={22} className="text-[#DC2626]" />
                <h3 className="text-xl font-black text-slate-950">Puri Gate Shop Investigation</h3>
              </div>
              <button type="button" aria-label="Close modal" onClick={() => setInvestigateOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm font-semibold text-slate-700">
              <p className="rounded-lg bg-red-50 p-3 text-red-900">156 of 160 collections completed in 2 hours, far above district average.</p>
              <p className="rounded-lg bg-slate-50 p-3">Current stock is critical: Rice 8kg, Wheat 5kg, Oil 3L.</p>
              <p className="rounded-lg bg-slate-50 p-3">Recommended action: freeze bulk approvals, dispatch field inspector, and verify last 25 transactions.</p>
            </div>
            <button
              type="button"
              onClick={() => sendResupply(mockShops[2])}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-3 text-sm font-black text-white"
            >
              <PackagePlus size={18} /> Send Emergency Resupply
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
