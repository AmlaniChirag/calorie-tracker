"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import { getLast7Days, getTodayString } from "@/lib/utils";
import WeeklyChart from "@/components/WeeklyChart";
import DailyHistory, { type DayRecord } from "@/components/DailyHistory";
import Navbar from "@/components/Navbar";

interface Meal { date: string; calories: number; protein: number; carbs: number; fat: number; }

export default function HistoryPage() {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/profile");
      const profile = await profileRes.json();
      setCalorieGoal(profile.calorieGoal ?? 2000);

      const days: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
      }

      const mealsPerDay = await Promise.all(
        days.map((date) => fetch(`/api/meals?date=${date}`).then((r) => r.json()))
      );

      const built: DayRecord[] = days
        .map((date, i) => {
          const dayMeals: Meal[] = mealsPerDay[i] ?? [];
          if (dayMeals.length === 0) return null;
          return {
            date,
            calories: Math.round(dayMeals.reduce((s: number, m: Meal) => s + m.calories, 0)),
            protein: Math.round(dayMeals.reduce((s: number, m: Meal) => s + m.protein, 0) * 10) / 10,
            carbs: Math.round(dayMeals.reduce((s: number, m: Meal) => s + m.carbs, 0) * 10) / 10,
            fat: Math.round(dayMeals.reduce((s: number, m: Meal) => s + m.fat, 0) * 10) / 10,
            mealCount: dayMeals.length,
          };
        })
        .filter(Boolean) as DayRecord[];

      setRecords(built.reverse());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const today = getTodayString();
  const last7 = getLast7Days();

  const logged7 = records.filter((r) => last7.includes(r.date));
  const avg7 = logged7.length > 0
    ? Math.round(logged7.reduce((s, r) => s + r.calories, 0) / logged7.length)
    : 0;

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (records.find((r) => r.date === dateStr)) streak++;
    else break;
  }

  const chartData = records.map((r) => ({ date: r.date, calories: r.calories }));

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in pt-2">
            <h1 className="text-xl font-bold">History</h1>

            <div className="grid grid-cols-3 gap-3">
              <div className="surface rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
                <p className="text-xs text-muted mt-1">Day streak</p>
              </div>
              <div className="surface rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{avg7.toLocaleString()}</p>
                <p className="text-xs text-muted mt-1">7-day avg kcal</p>
              </div>
              <div className="surface rounded-2xl p-4 text-center">
                <p className={`text-2xl font-bold ${avg7 <= calorieGoal ? "text-blue-500" : "text-red-500"}`}>
                  {calorieGoal > 0 ? `${Math.round((avg7 / calorieGoal) * 100)}%` : "—"}
                </p>
                <p className="text-xs text-muted mt-1">of daily goal</p>
              </div>
            </div>

            <WeeklyChart data={chartData} goal={calorieGoal} />
            <DailyHistory records={records} goal={calorieGoal} />

            {records.length === 0 && (
              <div className="text-center py-12 text-muted">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm">No data yet. Start logging meals on the dashboard!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
