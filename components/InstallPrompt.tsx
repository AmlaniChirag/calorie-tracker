"use client";
import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwaPromptDismissed_v2"; // bump version to reset prior dismisses
const DISMISS_TTL = 7 * 86400_000; // 7 days

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    return !!ts && Date.now() - Number(ts) < DISMISS_TTL;
  } catch { return false; }
}

function setDismissed() {
  try { localStorage.setItem(DISMISS_KEY, Date.now().toString()); } catch { /* */ }
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    if (isIOS()) {
      // iOS Safari: no beforeinstallprompt — show manual instructions
      setShowIOS(true);
      setVisible(true);
      return;
    }

    // Android/Chrome: event may have already fired before React hydrated.
    // Inline script in layout.tsx captures it on window.__pwaPrompt.
    const w = window as Window & { __pwaPrompt?: BeforeInstallPromptEvent };
    if (w.__pwaPrompt) {
      setAndroidPrompt(w.__pwaPrompt);
      setVisible(true);
      return;
    }

    // Fallback: listen in case it fires after hydration
    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!androidPrompt) return;
    await androidPrompt.prompt();
    const { outcome } = await androidPrompt.userChoice;
    if (outcome === "dismissed") setDismissed();
    setVisible(false);
    setAndroidPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed();
    setVisible(false);
  };

  if (!visible) return null;
  if (!showIOS && !androidPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 surface rounded-2xl p-4 shadow-2xl border border-[rgb(var(--border))] animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-2xl shadow">
          🥗
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install CalTrack</p>

          {showIOS ? (
            <>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Tap the <Share size={11} className="inline mx-0.5 -mt-0.5" /> Share button
                at the bottom of Safari, then choose{" "}
                <span className="font-medium text-[rgb(var(--text))]">&ldquo;Add to Home Screen&rdquo;</span>.
              </p>
              <button
                onClick={handleDismiss}
                className="mt-3 w-full py-2 rounded-xl border border-[rgb(var(--border))] text-xs text-muted hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Got it
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted mt-0.5">Add to home screen — no browser bar, works offline</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAndroidInstall}
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
