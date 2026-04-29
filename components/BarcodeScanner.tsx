"use client";
import { useEffect, useRef, useState } from "react";
import { X, ScanLine } from "lucide-react";
import type { FoodItem } from "@/lib/foods";

interface Props {
  onFound: (food: FoodItem) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onFound, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"scanning" | "loading" | "error">("scanning");
  const [errorMsg, setErrorMsg] = useState("");
  const readerRef = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader as unknown as { reset: () => void };

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        ) ?? devices[0];

        if (!backCamera) {
          setErrorMsg("No camera found");
          setStatus("error");
          return;
        }

        await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
          async (result, err) => {
            if (!result || !active) return;
            if (err) return;

            const barcode = result.getText();
            (reader as unknown as { reset: () => void }).reset();
            if (!active) return;

            setStatus("loading");
            try {
              const res = await fetch(`/api/food/barcode?barcode=${encodeURIComponent(barcode)}`);
              if (!res.ok) throw new Error("Product not found in database");
              const food = await res.json();
              if (active) onFound(food);
            } catch (e) {
              if (active) {
                setErrorMsg(e instanceof Error ? e.message : "Product not found");
                setStatus("error");
              }
            }
          }
        );
      } catch (e) {
        if (active) {
          setErrorMsg(e instanceof Error ? e.message : "Camera access denied");
          setStatus("error");
        }
      }
    };

    start();
    return () => {
      active = false;
      readerRef.current?.reset();
    };
  }, [onFound]);

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="surface rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <h2 className="font-semibold flex items-center gap-2">
            <ScanLine size={18} className="text-green-500" /> Scan Barcode
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-square bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-green-400 rounded-xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
            </div>
          </div>
        </div>

        <div className="p-4 text-center text-sm text-muted">
          {status === "scanning" && "Point camera at a food barcode"}
          {status === "loading" && (
            <span className="text-green-500 font-medium">Looking up product...</span>
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
