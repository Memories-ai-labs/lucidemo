import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import logoUrl from "../assets/logo.svg";
import "./Island.css";

type IslandState = "idle" | "listening" | "loading";

export default function Island() {
  const [state, setState] = useState<IslandState>("idle");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    const unlistenStart = listen("recording-start", () => {
      setState("listening");
      startListening();
    });

    const unlistenStop = listen("recording-stop", () => {
      setState("loading");
      stopAndSend();
    });

    return () => {
      unlistenStart.then((fn) => fn());
      unlistenStop.then((fn) => fn());
    };
  }, []);

  function startListening() {
    transcriptRef.current = "";
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Web Speech API not available");
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      transcriptRef.current = transcript;
    };

    recognition.onerror = (e: any) => {
      console.error("Speech error:", e.error);
      setState("idle");
    };

    recognition.start();
    recognitionRef.current = recognition;
  }

  function stopAndSend() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setState("idle");
      return;
    }

    recognition.onend = async () => {
      const text = transcriptRef.current.trim();
      if (text) {
        try {
          await invoke("send_to_channel", { text });
        } catch (e) {
          console.error("IPC error:", e);
        }
      }
      transcriptRef.current = "";
      setState("idle");
    };

    recognition.stop();
    recognitionRef.current = null;
  }

  return (
    <div className={`island island--${state}`} data-tauri-drag-region>
      <div className="island-logo" data-tauri-drag-region>
        <img src={logoUrl} alt="LUCI" />
      </div>

      {state === "idle" && (
        <div className="record-indicator" />
      )}

      {state === "listening" && (
        <div className="waveform">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="wave-bar"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {state === "loading" && (
        <div className="loading-dots">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="dot"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
