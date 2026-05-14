import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, History, Mic, Search, ShieldCheck, Square, UserRound, XCircle } from "lucide-react";
import AlertBanner from "../components/AlertBanner";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { askGemini, matchExtractedName } from "../gemini";
import { useFirestore } from "../hooks/useFirestore";
import { useVoice } from "../hooks/useVoice";
import { mockBeneficiaries } from "../utils/mockData";
import { fuzzyMatchBeneficiary } from "../utils/anomalyDetector";

const languages = [
  { code: "hi-IN", label: "Hindi" },
  { code: "or-IN", label: "Odia" },
  { code: "bn-IN", label: "Bengali" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
];

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function EntitlementTable({ beneficiary, collectedOverride }) {
  const collected = collectedOverride ?? beneficiary.collected;
  const rows = [
    ["Rice", `${beneficiary.entitlements.rice} kg`],
    ["Wheat", `${beneficiary.entitlements.wheat} kg`],
    ["Oil", `${beneficiary.entitlements.oil} L`],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map(([item, quantity]) => (
            <tr key={item}>
              <td className="px-4 py-3 font-bold text-slate-900">{item}</td>
              <td className="px-4 py-3 text-slate-600">{quantity}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${collected ? "bg-slate-100 text-slate-500" : "bg-green-50 text-[#16A34A]"}`}>
                  {collected ? "Collected" : "Due"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Beneficiary() {
  const [language, setLanguage] = useState("hi-IN");
  const [verified, setVerified] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [collectedIds, setCollectedIds] = useState(() => new Set(JSON.parse(localStorage.getItem("nyayanet_collected") || "[]")));
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const wasListening = useRef(false);
  const { user } = useAuth();
  const { transcript, isListening, startListening, stopListening, supported, error: voiceError } = useVoice(language);
  const { addTransaction, getLocalTransactions } = useFirestore();

  const searchedBeneficiary = useMemo(() => fuzzyMatchBeneficiary(search, mockBeneficiaries), [search]);
  const transactions = getLocalTransactions();

  useEffect(() => {
    if (wasListening.current && !isListening && transcript.trim()) {
      verifyTranscript(transcript);
    }
    wasListening.current = isListening;
  }, [isListening, transcript]);

  useEffect(() => {
    localStorage.setItem("nyayanet_collected", JSON.stringify(Array.from(collectedIds)));
  }, [collectedIds]);

  async function verifyTranscript(spokenText) {
    setIsVerifying(true);
    setVerificationError("");
    setVerified(null);

    try {
      const prompt = `Extract the person's full name from this speech transcript. 
Return ONLY the name, nothing else. 
Transcript: "${spokenText}"`;
      const extractedName = await askGemini(prompt);
      const match = matchExtractedName(extractedName);

      if (match) {
        setVerified(match);
      } else {
        setVerificationError(`No beneficiary found for "${extractedName.trim() || spokenText}".`);
      }
    } catch {
      setVerificationError("We could not verify the voice right now. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
      return;
    }
    setVerified(null);
    setVerificationError("");
    startListening();
  }

  async function markCollected() {
    if (!verified) return;
    try {
      await addTransaction({
        beneficiaryId: verified.id,
        beneficiaryName: verified.name,
        shopId: "S001",
        shopName: "Khordha Ward 12",
        items: verified.entitlements,
        collected: true,
        verifiedBy: user?.uid || "demo",
      });
      setCollectedIds((previous) => new Set([...previous, verified.id]));
      setToast("Collection recorded successfully.");
    } catch {
      setToast("Collection could not be written. Demo mode saved it locally.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#1B4FD8]">Beneficiary verification</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Voice AI ration eligibility</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Speak naturally in a local language. NyayaNet extracts the name, verifies entitlement, and records collection.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-[#1B4FD8]">
            Logged in as {user?.name || "Demo Beneficiary"}
          </div>
        </div>

        {toast && <div className="mb-4"><AlertBanner message={toast} type="info" onDismiss={() => setToast("")} /></div>}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">A. Voice Verification</h2>
                <p className="mt-1 text-sm font-medium text-slate-600">Auto-stops after 5 seconds of silence.</p>
              </div>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-[#1B4FD8]"
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {!supported && (
              <div className="mt-4">
                <AlertBanner message="Web Speech API is not available in this browser. Try Chrome for live voice, or use the checker below." type="warning" />
              </div>
            )}
            {voiceError && (
              <div className="mt-4">
                <AlertBanner message={voiceError} type="warning" />
              </div>
            )}

            <div className="mt-8 flex flex-col items-center text-center">
              <button
                type="button"
                onClick={handleMicClick}
                className={`flex h-28 w-28 items-center justify-center rounded-full text-white shadow-xl transition ${
                  isListening ? "pulse-recording bg-[#DC2626]" : "bg-[#1B4FD8] hover:bg-blue-700"
                }`}
                aria-label={isListening ? "Stop recording" : "Start voice recording"}
              >
                {isListening ? <Square size={34} fill="currentColor" /> : <Mic size={40} />}
              </button>
              <p className="mt-4 text-sm font-black text-slate-700">{isListening ? "Listening..." : "Tap to speak"}</p>
              <div className="mt-5 min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Live transcript</p>
                <p className="mt-2 text-base font-semibold leading-7 text-slate-800">{transcript || "Your spoken words will appear here."}</p>
              </div>
            </div>

            {isVerifying && <LoadingSpinner label="Gemini is verifying the name" />}

            {verified && (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
                <CheckCircle2 size={24} className="mt-0.5 text-[#16A34A]" />
                <div>
                  <p className="text-lg font-black">Verified</p>
                  <p className="text-sm font-semibold">{verified.name} is eligible for this month's ration.</p>
                </div>
              </div>
            )}

            {verificationError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
                <div className="flex items-start gap-3">
                  <XCircle size={24} className="mt-0.5 text-[#DC2626]" />
                  <div>
                    <p className="text-lg font-black">Not Found</p>
                    <p className="text-sm font-semibold">{verificationError}</p>
                  </div>
                </div>
                <button type="button" onClick={handleMicClick} className="mt-4 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-black text-white">
                  Retry
                </button>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">B. Verified Result Card</h2>
            {verified ? (
              <div className="mt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B4FD8] to-[#16A34A] text-2xl font-black text-white">
                    {initials(verified.name)}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-950">{verified.name}</p>
                    <p className="text-sm font-bold text-slate-500">
                      {verified.id} · {verified.district}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <EntitlementTable beneficiary={verified} collectedOverride={collectedIds.has(verified.id)} />
                </div>

                <button
                  type="button"
                  onClick={markCollected}
                  disabled={collectedIds.has(verified.id)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ShieldCheck size={18} />
                  {collectedIds.has(verified.id) ? "Already Collected" : "Mark as Collected"}
                </button>
              </div>
            ) : (
              <div className="mt-5 flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <UserRound size={44} className="text-slate-300" />
                <p className="mt-3 text-lg font-black text-slate-800">No beneficiary verified yet</p>
                <p className="mt-1 max-w-sm text-sm font-medium leading-6 text-slate-500">Use the microphone to verify a ration card holder and unlock their entitlement card.</p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">C. Entitlement Checker</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Search any beneficiary by name to view ration status and local collection history.</p>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:w-96">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Kamala Devi"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold outline-none"
              />
            </div>
          </div>

          {search && searchedBeneficiary ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-2xl font-black text-slate-950">{searchedBeneficiary.name}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {searchedBeneficiary.id} · {searchedBeneficiary.district}
                </p>
                <div className="mt-4">
                  <EntitlementTable beneficiary={searchedBeneficiary} collectedOverride={collectedIds.has(searchedBeneficiary.id)} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <History size={18} className="text-[#1B4FD8]" />
                  <p className="font-black text-slate-950">Collection history</p>
                </div>
                {transactions.filter((item) => item.beneficiaryId === searchedBeneficiary.id).length ? (
                  <div className="space-y-2">
                    {transactions
                      .filter((item) => item.beneficiaryId === searchedBeneficiary.id)
                      .map((item) => (
                        <div key={`${item.beneficiaryId}-${item.createdAt}`} className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-900">
                          Collected at {item.shopName} on {new Date(item.createdAt).toLocaleString()}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-500">No local collection history yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-500">
              {search ? "No matching beneficiary found." : "Try searching Kamala Devi, Mohan Das, or Lakshmi Bai."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
