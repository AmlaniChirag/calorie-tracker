"use client";
import { useEffect, useState } from "react";

interface MacroBarProps {
  label: string;
  eaten: number;
  goal: number;
  color: string;
  bgColor: string;
  unit?: string;
}

function MacroBar({ label, eaten, goal, color, bgColor, unit = "g" }: MacroBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pct = goal > 0 ? Math.min((eaten / goal) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {eaten.toFixed(1)}{unit} / {goal}{unit}
        </span>
      </div>
      <div className={`h-3 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${color} macro-bar-fill`}
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

interface Props {
  proteinEaten: number;
  carbsEaten: number;
  fatEaten: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export default function MacroBars({ proteinEaten, carbsEaten, fatEaten, proteinGoal, carbGoal, fatGoal }: Props) {
  return (
    <div className="surface rounded-2xl p-4 space-y-4">
      <h3 className="font-semibold text-sm">Macros</h3>
      <MacroBar
        label="Protein"
        eaten={proteinEaten}
        goal={proteinGoal}
        color="bg-blue-500"
        bgColor="bg-blue-100 dark:bg-blue-950/40"
      />
      <MacroBar
        label="Carbs"
        eaten={carbsEaten}
        goal={carbGoal}
        color="bg-yellow-400"
        bgColor="bg-yellow-100 dark:bg-yellow-950/40"
      />
      <MacroBar
        label="Fat"
        eaten={fatEaten}
        goal={fatGoal}
        color="bg-red-400"
        bgColor="bg-red-100 dark:bg-red-950/40"
      />
    </div>
  );
}
