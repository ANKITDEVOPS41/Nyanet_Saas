import { GoogleGenerativeAI } from "@google/generative-ai";
import { mockBeneficiaries } from "./utils/mockData";
import { fuzzyMatchBeneficiary } from "./utils/anomalyDetector";

const apiKey = import.meta.env.VITE_GEMINI_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

function getTranscriptFromPrompt(prompt) {
  const match = prompt.match(/Transcript:\s*"([^"]*)"/i);
  return match?.[1] || "";
}

function mockGeminiResponse(prompt) {
  if (prompt.includes("Extract the person's full name")) {
    const transcript = getTranscriptFromPrompt(prompt);
    const matched = mockBeneficiaries.find((beneficiary) =>
      transcript.toLowerCase().includes(beneficiary.name.toLowerCase()),
    );
    return matched?.name || transcript.replace(/my name is|mera naam|namaskar|hello|i am/gi, "").trim();
  }

  if (prompt.includes("Current stock: Rice: 34kg")) {
    return "• Wheat will run out first; reorder at least 176kg today.\n• Oil is also critical; request 88L before next distribution window.\n• Rice needs 406kg more to serve all remaining families.";
  }

  if (prompt.includes("district welfare officer")) {
    return "• Dispatch emergency wheat/oil stock to Puri Gate, Jatni Block, and Mancheswar today.\n• Investigate Puri Gate anomaly before approving further collections.\n• Rebalance stock from Bhubaneswar Central, Patia, and Chandrasekharpur.";
  }

  return "AI demo response generated from mock data. Add VITE_GEMINI_KEY for live Gemini output.";
}

export async function askGemini(prompt) {
  if (!model) return mockGeminiResponse(prompt);

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini request failed", error);
    return mockGeminiResponse(prompt);
  }
}

export function matchExtractedName(extractedName) {
  return fuzzyMatchBeneficiary(extractedName, mockBeneficiaries);
}

