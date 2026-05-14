import { LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleLabels } from "../utils/mockData";

export default function Navbar() {
  const { isAuthenticated, role, demoMode, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="bg-gradient-to-r from-[#1B4FD8] to-[#16A34A] bg-clip-text text-xl font-black tracking-tight text-transparent">
          NyayaNet
        </Link>
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 sm:text-sm">
          <ShieldCheck size={16} className="text-[#16A34A]" />
          <span className="truncate">{roleLabels[role] || "User"}</span>
          {demoMode && <span className="rounded-full bg-[#1B4FD8] px-2 py-0.5 text-[10px] font-black uppercase text-white">Demo Mode</span>}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

