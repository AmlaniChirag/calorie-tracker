import type { FoodItem } from "./foods";

export function calcNutritionFromGrams(food: FoodItem, grams: number) {
  const f = Math.max(0, grams) / 100;
  return {
    calories: Math.round(food.calories * f),
    protein: Math.round(food.protein * f * 10) / 10,
    carbs: Math.round(food.carbs * f * 10) / 10,
    fat: Math.round(food.fat * f * 10) / 10,
    fiber: Math.round(food.fiber * f * 10) / 10,
  };
}

export type NutritionResult = ReturnType<typeof calcNutritionFromGrams>;

// ── Food Badges ──
// All thresholds are per 100g values stored on FoodItem
export interface FoodBadge {
  label: string;
  cls: string;
}

export function getFoodBadges(food: FoodItem): FoodBadge[] {
  const badges: FoodBadge[] = [];
  const netCarbs = food.carbs - food.fiber;
  const fatCalPct = food.calories > 0 ? (food.fat * 9) / food.calories : 0;

  // High Protein — ≥20g per 100g
  if (food.protein >= 20)
    badges.push({
      label: "High Protein",
      cls: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/25 dark:text-blue-200 dark:border-blue-400/40",
    });

  // Low Carb — ≤5g carbs per 100g
  if (food.carbs <= 5 && food.calories > 0)
    badges.push({
      label: "Low Carb",
      cls: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-400/40",
    });

  // High Fiber — ≥5g fiber per 100g
  if (food.fiber >= 5)
    badges.push({
      label: "High Fiber",
      cls: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/25 dark:text-emerald-200 dark:border-emerald-400/40",
    });

  // Low Cal — ≤50 kcal per 100g
  if (food.calories <= 50 && food.calories > 0)
    badges.push({
      label: "Low Cal",
      cls: "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-500/25 dark:text-teal-200 dark:border-teal-400/40",
    });

  // Keto-friendly — fat > 60% of calories AND carbs ≤ 10g
  if (fatCalPct > 0.60 && food.carbs <= 10 && food.calories > 0)
    badges.push({
      label: "Keto",
      cls: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-500/25 dark:text-purple-200 dark:border-purple-400/40",
    });

  // High Sugar — net carbs (carbs − fiber) > 25g, warning badge
  if (netCarbs > 25 && food.fiber < 4)
    badges.push({
      label: "High Sugar",
      cls: "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/25 dark:text-rose-200 dark:border-rose-400/40",
    });

  return badges;
}
