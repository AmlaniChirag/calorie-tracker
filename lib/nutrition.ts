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
