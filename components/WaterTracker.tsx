"use client";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  glasses: number;
  target?: number;
  onChange: (glasses: number) => void;
}

export default function WaterTracker({ glasses, target = 8, onChange }: Props) {
  const handleClick = (idx: number) => {
    // Toggle: if clicking the last filled glass, remove it; else fill up to idx+1
    if (glasses === idx + 1) {
      onChange(idx);
    } else {
      onChange(idx + 1);
    }
  };

  return (
    <div className="surface rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" /> Water
        </h3>
        <span className="text-xs text-muted">{glasses} / {target} glasses</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: target }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={cn(
              "water-glass w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors",
              i < glasses
                ? "bg-blue-400 text-white shadow-sm"
                : "bg-blue-50 dark:bg-blue-950/30 text-blue-200"
            )}
            aria-label={`${i < glasses ? "Remove" : "Add"} glass ${i + 1}`}
          >
            💧
          </button>
        ))}
      </div>
      {glasses >= target && (
        <p className="text-xs text-blue-500 font-medium">Great job — daily hydration goal met! 🎉</p>
      )}
      {glasses === 0 && (
        <p className="text-xs text-muted">Tap a droplet to log water intake</p>
      )}
    </div>
  );
}
