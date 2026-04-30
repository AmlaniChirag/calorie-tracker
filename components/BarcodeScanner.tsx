"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { X, ScanLine } from "lucide-react";
import type { FoodItem } from "@/lib/foods";

interface Props {
  onFound: (food: FoodItem) => void;
  onClose: () => void;
}

// BarcodeDetector is native on Android Chrome 83+, Chrome Desktop, Edge
interface BarcodeDet {
  detect(src: HTMLVideoElement | HTMLCanvasElement): Promise<Array<{ rawValue: string }>>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDet;
  }
}

const BARCODE_FORMATS = [
  "ean_13", "ean_8", "upc_a", "upc_e",
  "code_128", "code_39", "code_93", "qr_code", "data_matrix",
];

export default function BarcodeScanner({ onFound, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onFoundRef = useRef(onFound);
  const [status, setStatus] = useState<"scanning" | "loading" | "error">("scanning");
  const [errorMsg, setErrorMsg] = useState("");

  // Keep ref in sync without triggering effect restarts
  useEffect(() => { onFoundRef.current = onFound; }, [onFound]);

  const handleBarcode = useCallback(async (barcode: string) => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/food/barcode?barcode=${encodeURIComponent(barcode)}`);
      if (!res.ok) throw new Error("Product not found in database");
      const food = await res.json();
      onFoundRef.current(food);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Product not found");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let active = true;
    let rafId = 0;

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    const start = async () => {
      try {
        // Get camera stream with back camera preference
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        await video.play();

        if (!active) return;

        // ── Native BarcodeDetector (Android Chrome, Chrome, Edge) ──
        if (typeof window !== "undefined" && window.BarcodeDetector) {
          const detector = new window.BarcodeDetector({ formats: BARCODE_FORMATS });

          const scan = async () => {
            if (!active || !video) return;
            if (video.readyState >= 2) {
              try {
                const results = await detector.detect(video);
                if (results.length > 0 && active) {
                  cancelAnimationFrame(rafId);
                  await handleBarcode(results[0].rawValue);
                  return;
                }
              } catch {
                // frame not ready, keep scanning
              }
            }
            if (active) rafId = requestAnimationFrame(scan);
          };

          rafId = requestAnimationFrame(scan);

        } else {
          // ── ZXing fallback (Firefox, older browsers) ──
          const { BrowserMultiFormatReader } = await import("@zxing/browser");
          if (!active) return;

          const reader = new BrowserMultiFormatReader();
          let decoded = false;

          try {
            await reader.decodeFromVideoElement(video, async (result, err) => {
              if (!result || !active || decoded || err) return;
              decoded = true;
              try { (reader as unknown as { reset(): void }).reset(); } catch { /* */ }
              await handleBarcode(result.getText());
            });
          } catch {
            // ZXing may throw if already stopped
          }
        }
      } catch (e) {
        if (active) {
          const msg = e instanceof Error ? e.message : "Camera error";
          setErrorMsg(
            msg.includes("Permission") || msg.includes("denied")
              ? "Camera permission denied. Allow camera access and retry."
              : msg
          );
          setStatus("error");
        }
      }
    };

    start();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      stopStream();
    };
  }, [handleBarcode]); // handleBarcode is stable (useCallback + no deps)

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="surface rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <h2 className="font-semibold flex items-center gap-2">
            <ScanLine size={18} className="text-green-500" /> Scan Barcode
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-square bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-52 h-52 relative">
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
              {status === "scanning" && (
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-400 opacity-70 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        <div className="p-4 text-center text-sm text-muted">
          {status === "scanning" && "Point camera at a food barcode"}
          {status === "loading" && (
            <span className="text-green-500 font-medium flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin inline-block" />
              Looking up product...
            </span>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <p className="text-red-500">{errorMsg}</p>
              <button
                onClick={() => { setStatus("scanning"); setErrorMsg(""); }}
                className="text-green-600 underline text-xs"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
