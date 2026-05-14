import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoice(language = "hi-IN") {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const supported = Boolean(SpeechRecognition);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    setIsListening(false);
  }, [clearSilenceTimer]);

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      stopListening();
    }, 5000);
  }, [clearSilenceTimer, stopListening]);

  const startListening = useCallback(() => {
    if (!supported) {
      setError("Voice recognition is not supported in this browser. Please type a name in the checker below.");
      return;
    }

    setTranscript("");
    setError("");

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      startSilenceTimer();
    };

    recognition.onresult = (event) => {
      startSilenceTimer();
      const spokenText = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscript(spokenText);
    };

    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Microphone permission was blocked." : "Voice recognition stopped unexpectedly.");
      setIsListening(false);
      clearSilenceTimer();
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [clearSilenceTimer, language, startSilenceTimer, supported]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      recognitionRef.current?.abort();
    };
  }, [clearSilenceTimer]);

  return { transcript, isListening, startListening, stopListening, supported, error };
}

