"use client";
import { useEffect, useState } from "react";

interface Props {
  eaten: number;
  goal: number;
}

export default function CalorieRing({ eaten, goal }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const size = 200;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const offset = circ - pct * circ;

  const color =
    pct >= 1 ? "#ef4444" : pct >= 0.75 ? "#f59e0b" : "#22c55e";

  const remaining = goal - eaten;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(var(--ring-track))"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={mounted ? offset : circ}
            className="calorie-ring-progress"
            style={{ transformOrigin: `${size / 2}px ${size / 2}px`, transform: "rotate(-90deg)" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {eaten.toLocaleString()}
          </span>
          <span className="text-xs text-muted">of {goal.toLocaleString()} kcal</span>
          <span className="text-xs font-medium mt-0.5" style={{ color }}>
            {pct >= 1
              ? `${(eaten - goal).toLocaleString()} over`
              : `${remaining.toLocaleString()} left`}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted">
        {pct >= 1
          ? "Daily goal reached!"
          : pct >= 0.75
          ? "Almost there — stay mindful"
          : "Keep going — you're on track"}
      </p>
    </div>
  );
}
