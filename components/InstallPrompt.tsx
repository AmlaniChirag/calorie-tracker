"use client";
import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent;
  }
}

const DISMISS_KEY = "pwaPromptDismissed_v3";
const DISMISS_TTL = 7 * 86400_000;

function wasDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    return !!ts && Date.now() - Number(ts) < DISMISS_TTL;
  } catch { return false; }
}
function markDismissed() {
  try { localStorage.setItem(DISMISS_KEY, Date.now().toString()); } catch { /* */ }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream;
}

function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [nativePrompt, setNativePrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other" | null>(null);

  useEffect(() => {
    // Already installed or dismissed — do nothing
    if (isStandalone() || wasDismissed()) return;

    const plt = isIOS() ? "ios" : isAndroid() ? "android" : "other";
    setPlatform(plt);

    // Grab stored native prompt if Chrome already fired it
    if (window.__pwaPrompt) setNativePrompt(window.__pwaPrompt);

    // Also listen for late fires
    const handler = (e: Event) => {
      e.preventDefault();
      setNativePrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show banner after 3 s regardless — don't gate on event
    const timer = setTimeout(() => setVisible(true), 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!nativePrompt) return;
    await nativePrompt.prompt();
    const { outcome } = await nativePrompt.userChoice;
    if (outcome === "dismissed") markDismissed();
    setVisible(false);
  };

  const handleDismiss = () => {
    markDismissed();
    setVisible(false);
  };

  if (!visible || !platform) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 surface rounded-2xl p-4 shadow-2xl border border-[rgb(var(--border))] animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-2xl shadow">
          🥗
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install CalTrack</p>

          {/* iOS — always manual */}
          {platform === "ios" && (
            <>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Tap <Share size={11} className="inline mx-0.5 -mt-0.5" /> at the bottom of
                Safari, then <span className="font-semibold text-[rgb(var(--text))]">Add to Home Screen</span>.
              </p>
              <button onClick={handleDismiss}
                className="mt-3 w-full py-2 rounded-xl border border-[rgb(var(--border))] text-xs text-muted hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Got it
              </button>
            </>
          )}

          {/* Android — native prompt if available, else manual menu steps */}
          {(platform === "android" || platform === "other") && (
            <>
              {nativePrompt ? (
                <>
                  <p className="text-xs text-muted mt-1">Add to home screen — no browser bar, works offline</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleNativeInstall}
                      className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                      <Download size={13} /> Install
                    </button>
                    <button onClick={handleDismiss}
                      className="px-3 py-2 rounded-xl border border-[rgb(var(--border))] text-xs text-muted transition-colors">
                      Later
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Tap <span className="font-semibold text-[rgb(var(--text))]">⋮ menu</span> in
                    Chrome → <span className="font-semibold text-[rgb(var(--text))]">Add to Home screen</span>{" "}
                    to install as an app.
                  </p>
                  <button onClick={handleDismiss}
                    className="mt-3 w-full py-2 rounded-xl border border-[rgb(var(--border))] text-xs text-muted hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    Got it
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <button onClick={handleDismiss} className="text-muted hover:text-[rgb(var(--text))] p-0.5 flex-shrink-0">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
