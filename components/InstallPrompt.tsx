"use client";
import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Dismissed within last 7 days
    const dismissed = localStorage.getItem("pwaPromptDismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 86400_000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setVisible(false);
    setPrompt(null);
    if (outcome === "dismissed") {
      localStorage.setItem("pwaPromptDismissed", Date.now().toString());
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwaPromptDismissed", Date.now().toString());
    setVisible(false);
  };

  if (!visible || !prompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 surface rounded-2xl p-4 shadow-2xl border border-[rgb(var(--border))] animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-2xl shadow">
          🥗
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install CalTrack</p>
          <p className="text-xs text-muted mt-0.5">Add to home screen — works offline, no browser bar</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download size={13} /> Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-xl border border-[rgb(var(--border))] text-xs text-muted hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted hover:text-[rgb(var(--text))] p-0.5">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
