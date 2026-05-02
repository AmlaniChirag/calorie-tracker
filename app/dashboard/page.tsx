"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTodayString } from "@/lib/utils";
import { calcMacroGoals } from "@/lib/tdee";
import CalorieRing from "@/components/CalorieRing";
import StatCards from "@/components/StatCards";
import MacroBars from "@/components/MacroBars";
import WaterTracker from "@/components/WaterTracker";
import MealSection, { type MealEntry } from "@/components/MealSection";
import ExerciseLog, { type ExerciseEntry } from "@/components/ExerciseLog";
import FoodSearchModal from "@/components/FoodSearchModal";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";

interface UserProfile {
  calorieGoal: number;
  proteinGoalG: number | null;
  carbGoalG: number | null;
  fatGoalG: number | null;
  useCustomMacros: boolean;
  onboardingDone: boolean;
  darkMode: boolean;
  showWater: boolean;
}

interface Toast {
  id: number;
  msg: string;
  type: "success" | "error" | "info";
}

const MEAL_TYPES = [
  { type: "breakfast", label: "Breakfast", emoji: "🌅" },
  { type: "lunch", label: "Lunch", emoji: "☀️" },
  { type: "dinner", label: "Dinner", emoji: "🌙" },
  { type: "snacks", label: "Snacks", emoji: "🍎" },
];

let toastCounter = 0;

export default function DashboardPage() {
  const router = useRouter();
  const today = getTodayString();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const [copyingYesterday, setCopyingYesterday] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [streak, setStreak] = useState(0);

  const addToast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (profile?.darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [profile?.darkMode]);

  const fetchAll = useCallback(async () => {
    try {
      const [profileRes, mealsRes, exercisesRes, waterRes, streakRes] = await Promise.all([
        fetch("/api/profile"),
        fetch(`/api/meals?date=${today}`),
        fetch(`/api/exercise?date=${today}`),
        fetch(`/api/water?date=${today}`),
        fetch("/api/streak"),
      ]);
      const [p, m, e, w, s] = await Promise.all([
        profileRes.json(),
        mealsRes.json(),
        exercisesRes.json(),
        waterRes.json(),
        streakRes.json(),
      ]);

      if (!p.onboardingDone) { router.replace("/onboarding"); return; }

      setProfile(p);
      setMeals(m);
      setExercises(e);
      setWaterGlasses(w.glasses ?? 0);
      setStreak(s.streak ?? 0);
    } finally {
      setLoading(false);
    }
  }, [today, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Optimistic meal add ──
  const handleAddMeal = useCallback(async (data: {
    mealType: string; date: string; foodName: string; servingSize: number;
    calories: number; protein: number; carbs: number; fat: number; fiber: number;
  }) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMeal: MealEntry = {
      id: tempId,
      mealType: data.mealType,
      foodName: data.foodName,
      servingSize: data.servingSize,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
    };

    // Optimistic update — instant UI
    setMeals((prev) => [...prev, tempMeal]);

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      // Replace temp with real server entry
      setMeals((prev) => prev.map((m) => m.id === tempId ? saved : m));
      // Refresh streak silently after first meal of the day
      fetch("/api/streak").then((r) => r.json()).then((s) => setStreak(s.streak ?? 0)).catch(() => {});
    } catch {
      // Rollback on failure
      setMeals((prev) => prev.filter((m) => m.id !== tempId));
      addToast("Failed to save meal. Try again.", "error");
    }
  }, [addToast]);

  // ── Copy yesterday's meals (all) ──
  const handleCopyYesterday = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    setCopyingYesterday(true);
    try {
      const res = await fetch(`/api/meals?date=${yesterdayStr}`);
      const yesterdayMeals: MealEntry[] = await res.json();

      if (!yesterdayMeals || yesterdayMeals.length === 0) {
        addToast("Nothing logged yesterday to copy.", "info");
        return;
      }

      await Promise.all(
        yesterdayMeals.map((m) =>
          handleAddMeal({
            mealType: m.mealType,
            date: today,
            foodName: m.foodName,
            servingSize: m.servingSize,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            fiber: 0,
          })
        )
      );

      addToast(`Copied ${yesterdayMeals.length} meal${yesterdayMeals.length > 1 ? "s" : ""} from yesterday`, "success");
    } catch {
      addToast("Couldn't copy yesterday's meals.", "error");
    } finally {
      setCopyingYesterday(false);
    }
  };

  // ── Copy yesterday's meals for ONE meal type ──
  const handleCopyYesterdayMeal = useCallback(async (mealType: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    try {
      const res = await fetch(`/api/meals?date=${yesterdayStr}`);
      const allYesterday: MealEntry[] = await res.json();
      const filtered = allYesterday.filter((m) => m.mealType === mealType);

      if (filtered.length === 0) {
        addToast(`Nothing logged for ${mealType} yesterday.`, "info");
        return;
      }

      await Promise.all(
        filtered.map((m) =>
          handleAddMeal({
            mealType: m.mealType,
            date: today,
            foodName: m.foodName,
            servingSize: m.servingSize,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            fiber: 0,
          })
        )
      );

      addToast(`Copied ${filtered.length} item${filtered.length !== 1 ? "s" : ""} from yesterday's ${mealType}`, "success");
    } catch {
      addToast(`Couldn't copy yesterday's ${mealType}.`, "error");
    }
  }, [today, handleAddMeal, addToast]);

  const handleDeleteMeal = async (id: string) => {
    // Optimistic delete
    setMeals((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/meals/${id}`, { method: "DELETE" });
    } catch {
      // Refetch on failure
      fetchAll();
    }
  };

  const handleAddExercise = async (data: { date: string; name: string; caloriesBurned: number }) => {
    const res = await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const ex = await res.json();
    setExercises((prev) => [...prev, ex]);
  };

  const handleDeleteExercise = async (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    } catch { fetchAll(); }
  };

  const handleWater = async (glasses: number) => {
    setWaterGlasses(glasses);
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, glasses }),
    });
  };

  // ── Skeleton ──
  if (loading) return <DashboardSkeleton />;
  if (!profile) return null;

  const calorieGoal = profile.calorieGoal;
  const autoMacros = calcMacroGoals(calorieGoal);
  const proteinGoal = profile.useCustomMacros && profile.proteinGoalG != null ? profile.proteinGoalG : autoMacros.proteinG;
  const carbGoal = profile.useCustomMacros && profile.carbGoalG != null ? profile.carbGoalG : autoMacros.carbG;
  const fatGoal = profile.useCustomMacros && profile.fatGoalG != null ? profile.fatGoalG : autoMacros.fatG;

  const totalEaten = meals.reduce((s, m) => s + m.calories, 0);
  const totalBurned = exercises.reduce((s, e) => s + e.caloriesBurned, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  const netCalories = totalEaten - totalBurned;
  const deficit = calorieGoal - netCalories;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Toast notifications ── */}
      <div className="fixed top-16 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up pointer-events-auto
              ${t.type === "success" ? "bg-green-500 text-white" : t.type === "error" ? "bg-red-500 text-white" : "bg-slate-700 text-white"}`}
          >
            {t.type === "success" && <CheckCircle size={15} />}
            {t.type === "error" && <AlertCircle size={15} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Date header + Copy yesterday ── */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tabular">Today</h1>
            {streak > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                🔥 {streak}
                <span className="font-normal hidden sm:inline">day{streak !== 1 ? "s" : ""}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={handleCopyYesterday}
          disabled={copyingYesterday}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[rgb(var(--border))] text-muted hover:text-[rgb(var(--text))] hover:border-green-400 hover:text-green-600 disabled:opacity-50 transition-all press"
        >
          {copyingYesterday ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Copy size={13} />
          )}
          {copyingYesterday ? "Copying..." : "Copy Yesterday"}
        </button>
      </div>

      {/* ── Calorie Ring ── */}
      <div className="card p-6 flex justify-center">
        <CalorieRing eaten={totalEaten} goal={calorieGoal} />
      </div>

      {/* ── Net calories indicator ── */}
      {totalBurned > 0 && (
        <div className={`card px-4 py-3 flex items-center justify-between text-sm`}>
          <span className="text-muted">Net calories (eaten − burned)</span>
          <span className={`font-bold tabular ${deficit >= 0 ? "text-green-600" : "text-red-500"}`}>
            {netCalories.toLocaleString()} kcal
            <span className="text-xs font-normal text-muted ml-1">
              ({deficit >= 0 ? `-${deficit}` : `+${Math.abs(deficit)}`} vs goal)
            </span>
          </span>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <StatCards goal={calorieGoal} eaten={totalEaten} burned={totalBurned} />

      {/* ── Macro Bars ── */}
      <MacroBars
        proteinEaten={totalProtein}
        carbsEaten={totalCarbs}
        fatEaten={totalFat}
        proteinGoal={proteinGoal}
        carbGoal={carbGoal}
        fatGoal={fatGoal}
      />

      {/* ── Water Tracker ── */}
      {profile.showWater && <WaterTracker glasses={waterGlasses} onChange={handleWater} />}

      {/* ── Meal Sections ── */}
      <div className="space-y-3">
        {MEAL_TYPES.map(({ type, label, emoji }) => (
          <MealSection
            key={type}
            type={type}
            label={label}
            emoji={emoji}
            meals={meals.filter((m) => m.mealType === type)}
            onAddClick={() => setActiveMeal(type)}
            onDelete={handleDeleteMeal}
            onCopyYesterday={() => handleCopyYesterdayMeal(type)}
          />
        ))}
      </div>

      {/* ── Exercise ── */}
      <ExerciseLog
        exercises={exercises}
        date={today}
        onAdd={handleAddExercise}
        onDelete={handleDeleteExercise}
      />

      {/* ── Food Search Modal ── */}
      {activeMeal && (
        <FoodSearchModal
          mealType={activeMeal}
          date={today}
          onAdd={handleAddMeal}
          onClose={() => setActiveMeal(null)}
        />
      )}
    </div>
  );
}
