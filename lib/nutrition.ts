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

  if (food.protein >= 20)
    badges.push({ label: "High Protein", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" });

  if (food.carbs <= 5 && food.calories > 0)
    badges.push({ label: "Low Carb", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" });

  if (food.fiber >= 5)
    badges.push({ label: "High Fiber", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" });

  if (food.calories <= 50 && food.calories > 0)
    badges.push({ label: "Low Cal", cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" });

  return badges;
}
