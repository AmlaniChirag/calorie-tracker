"use client";
import { useState, useEffect, useCallback } from "react";
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

interface UserProfile {
  calorieGoal: number;
  proteinGoalG: number | null;
  carbGoalG: number | null;
  fatGoalG: number | null;
  useCustomMacros: boolean;
  onboardingDone: boolean;
  darkMode: boolean;
}

const MEAL_TYPES = [
  { type: "breakfast", label: "Breakfast", emoji: "🌅" },
  { type: "lunch", label: "Lunch", emoji: "☀️" },
  { type: "dinner", label: "Dinner", emoji: "🌙" },
  { type: "snacks", label: "Snacks", emoji: "🍎" },
];

export default function DashboardPage() {
  const router = useRouter();
  const today = getTodayString();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState<string | null>(null);

  // Apply dark mode
  useEffect(() => {
    if (profile?.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [profile?.darkMode]);

  const fetchAll = useCallback(async () => {
    try {
      const [profileRes, mealsRes, exercisesRes, waterRes] = await Promise.all([
        fetch("/api/profile"),
        fetch(`/api/meals?date=${today}`),
        fetch(`/api/exercise?date=${today}`),
        fetch(`/api/water?date=${today}`),
      ]);
      const [p, m, e, w] = await Promise.all([
        profileRes.json(),
        mealsRes.json(),
        exercisesRes.json(),
        waterRes.json(),
      ]);

      if (!p.onboardingDone) { router.replace("/onboarding"); return; }

      setProfile(p);
      setMeals(m);
      setExercises(e);
      setWaterGlasses(w.glasses ?? 0);
    } finally {
      setLoading(false);
    }
  }, [today, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddMeal = async (data: {
    mealType: string; date: string; foodName: string; servingSize: number;
    calories: number; protein: number; carbs: number; fat: number; fiber: number;
  }) => {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const meal = await res.json();
    setMeals((prev) => [...prev, meal]);
  };

  const handleDeleteMeal = async (id: string) => {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
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
    await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleWater = async (glasses: number) => {
    setWaterGlasses(glasses);
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, glasses }),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Date header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold">Today</h1>
          <p className="text-xs text-muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Calorie Ring */}
      <div className="surface rounded-2xl p-6 flex justify-center">
        <CalorieRing eaten={totalEaten} goal={calorieGoal} />
      </div>

      {/* Stat Cards */}
      <StatCards goal={calorieGoal} eaten={totalEaten} burned={totalBurned} />

      {/* Macro Bars */}
      <MacroBars
        proteinEaten={totalProtein}
        carbsEaten={totalCarbs}
        fatEaten={totalFat}
        proteinGoal={proteinGoal}
        carbGoal={carbGoal}
        fatGoal={fatGoal}
      />

      {/* Water Tracker */}
      <WaterTracker glasses={waterGlasses} onChange={handleWater} />

      {/* Meal Sections */}
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
          />
        ))}
      </div>

      {/* Exercise */}
      <ExerciseLog
        exercises={exercises}
        date={today}
        onAdd={handleAddExercise}
        onDelete={handleDeleteExercise}
      />

      {/* Food Search Modal */}
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
