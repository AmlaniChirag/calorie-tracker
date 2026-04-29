"use client";
import { formatDate } from "@/lib/utils";
import { Flame } from "lucide-react";

export interface DayRecord {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
}

interface Props {
  records: DayRecord[];
  goal: number;
}

export default function DailyHistory({ records, goal }: Props) {
  if (records.length === 0) {
    return (
      <div className="surface rounded-2xl p-8 flex flex-col items-center gap-3 text-muted">
        <span className="text-4xl">📋</span>
        <p className="text-sm">No history yet. Start logging today!</p>
      </div>
    );
  }

  return (
    <div className="surface rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[rgb(var(--border))]">
        <h3 className="font-semibold text-sm">Daily Log History</h3>
      </div>
      <div className="divide-y divide-[rgb(var(--border))]">
        {records.map((day) => {
          const over = goal > 0 && day.calories > goal;
          const pct = goal > 0 ? Math.round((day.calories / goal) * 100) : 0;
          return (
            <div key={day.date} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
              <div>
                <p className="text-sm font-medium">{formatDate(day.date)}</p>
                <p className="text-xs text-muted">
                  {day.mealCount} item{day.mealCount !== 1 ? "s" : ""} · P:{day.protein.toFixed(0)}g C:{day.carbs.toFixed(0)}g F:{day.fat.toFixed(0)}g
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${over ? "text-red-500" : "text-green-600"}`}>
                  {day.calories.toLocaleString()} kcal
                </p>
                <p className="text-xs text-muted flex items-center justify-end gap-1">
                  {over && <Flame size={11} className="text-red-400" />}
                  {pct}% of goal
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
