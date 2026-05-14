import { useEffect, useMemo, useState } from "react";
import { Chrome, KeyRound, LogIn, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AlertBanner from "../components/AlertBanner";
import { useAuth } from "../context/AuthContext";
import { demoAccounts, roleLabels } from "../utils/mockData";

export default function Login() {
  const [params] = useSearchParams();
  const requestedRole = params.get("role") || "beneficiary";
  const account = demoAccounts[requestedRole] || demoAccounts.beneficiary;
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState(account.password);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { loginWithEmail, loginWithGoogle, loginDemo } = useAuth();
  const navigate = useNavigate();

  const roleText = useMemo(() => roleLabels[requestedRole] || "Beneficiary", [requestedRole]);

  useEffect(() => {
    setEmail(account.email);
    setPassword(account.password);
  }, [account.email, account.password]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const path = await loginWithEmail(email, password, requestedRole);
      navigate(path);
    } catch (authError) {
      setError(authError.message || "Login failed. Use a demo account if Firebase is not configured.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      const path = await loginWithGoogle(requestedRole);
      navigate(path);
    } catch (authError) {
      setError(authError.message || "Google sign-in failed. Demo login is available below.");
    } finally {
      setBusy(false);
    }
  }

  function handleDemo(role) {
    const path = loginDemo(role);
    navigate(path);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto mb-6 block w-fit bg-gradient-to-r from-[#1B4FD8] to-[#16A34A] bg-clip-text text-4xl font-black text-transparent">
          NyayaNet
        </Link>
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-wide text-[#1B4FD8]">{roleText} portal</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Sign in securely</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Use Firebase auth in production, or demo credentials for judging.</p>
          </div>

          <AlertBanner message={error} type="danger" onDismiss={() => setError("")} />

          <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="email">
            Email
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-[#1B4FD8]">
            <Mail size={18} className="text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium outline-none"
              required
            />
          </div>

          <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-[#1B4FD8]">
            <KeyRound size={18} className="text-slate-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B4FD8] px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} /> {busy ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Chrome size={18} /> Continue with Google
          </button>

          <div className="my-5 h-px bg-slate-200" />

          <div className="grid gap-2">
            <button type="button" onClick={() => handleDemo("beneficiary")} className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-black text-[#1B4FD8] transition hover:bg-blue-100">
              Login as Beneficiary Demo
            </button>
            <button type="button" onClick={() => handleDemo("shopowner")} className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-black text-[#16A34A] transition hover:bg-green-100">
              Shop Owner Demo
            </button>
            <button type="button" onClick={() => handleDemo("officer")} className="rounded-lg bg-purple-50 px-4 py-2.5 text-sm font-black text-purple-700 transition hover:bg-purple-100">
              Officer Demo
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
