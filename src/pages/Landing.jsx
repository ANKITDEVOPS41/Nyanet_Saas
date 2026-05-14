import { ArrowRight, BadgeIndianRupee, Building2, HandHeart, MapPinned, Mic, ShieldCheck, Store, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="metric-count flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="rounded-lg bg-blue-50 p-2 text-[#1B4FD8]">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950">{value}</p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, copy, color, onClick }) {
  const palettes = {
    blue: "border-blue-100 bg-blue-50 text-[#1B4FD8] hover:border-blue-300",
    green: "border-green-100 bg-green-50 text-[#16A34A] hover:border-green-300",
    purple: "border-purple-100 bg-purple-50 text-purple-700 hover:border-purple-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group h-full rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${palettes[color]}`}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon size={27} />
      </div>
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-600">{copy}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-black">
        Continue <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  function goToLogin(role) {
    navigate(`/login?role=${role}`);
  }

  function tryDemo() {
    const path = loginDemo("beneficiary");
    navigate(path);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1B4FD8] via-[#16A34A] to-[#D97706]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="fade-in-up flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold text-[#1B4FD8]">
              <ShieldCheck size={16} /> Google Solution Challenge 2026
            </p>
            <h1 className="bg-gradient-to-r from-[#1B4FD8] to-[#16A34A] bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              NyayaNet
            </h1>
            <p className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
              Making sure welfare reaches the people who need it.
            </p>
            <div className="mt-8 rounded-lg border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-red-700">Annual leakage at stake</p>
              <p className="metric-count mt-1 text-3xl font-black text-red-700 sm:text-5xl">₹3,50,000 Crore</p>
              <p className="mt-2 text-sm font-semibold text-red-800">lost to welfare leakage yearly in India</p>
            </div>
            <p className="mt-6 text-lg font-semibold text-slate-600">Powered by Gemini AI · Built for 80 crore Indians</p>
            <button
              type="button"
              onClick={tryDemo}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Try Demo (No Login) <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid content-center gap-4">
            <RoleCard
              icon={UsersRound}
              title="I am a Beneficiary"
              copy="Verify identity with voice and check ration entitlements instantly."
              color="blue"
              onClick={() => goToLogin("beneficiary")}
            />
            <RoleCard
              icon={Store}
              title="I am a Shop Owner"
              copy="Track live stock, get AI reorder warnings, and verify beneficiaries."
              color="green"
              onClick={() => goToLogin("shopowner")}
            />
            <RoleCard
              icon={Building2}
              title="I am a District Officer"
              copy="Monitor shops on a map, catch fraud patterns, and act in real time."
              color="purple"
              onClick={() => goToLogin("officer")}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <Stat icon={Store} value="5.4 Lakh" label="ration shops in India" />
        <Stat icon={HandHeart} value="80 Crore" label="beneficiaries" />
        <Stat icon={MapPinned} value="0" label="AI solutions at scale until now" />
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#16A34A]">How it works</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Voice-first verification for the last mile</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Mic, title: "Speak your name", copy: "Use Hindi, Odia, Bengali, Tamil, or Telugu at the ration shop." },
              { icon: ShieldCheck, title: "AI verifies identity", copy: "Gemini extracts the name and matches records in seconds." },
              { icon: BadgeIndianRupee, title: "Collect protected ration", copy: "Transactions are tracked, officers are alerted, and stock is predicted." },
            ].map((step, index) => (
              <div key={step.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#1B4FD8] shadow-sm">
                  <step.icon size={25} />
                </div>
                <p className="text-sm font-black text-slate-400">Step {index + 1}</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{step.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-lg bg-[#E5243B] px-4 py-2 text-sm font-black text-white">SDG 1</span>
            <span className="rounded-lg bg-[#DDA63A] px-4 py-2 text-sm font-black text-white">SDG 2</span>
            <span className="rounded-lg bg-[#DD1367] px-4 py-2 text-sm font-black text-white">SDG 10</span>
          </div>
        </div>
      </section>
    </main>
  );
}

