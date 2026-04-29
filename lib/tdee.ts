export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

const MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(
  age: number,
  weight: number,
  height: number,
  gender: "male" | "female",
  activityLevel: ActivityLevel
): number {
  // Mifflin-St Jeor BMR
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  return Math.round(bmr * MULTIPLIERS[activityLevel]);
}

export function calcMacroGoals(calorieGoal: number) {
  return {
    proteinG: Math.round((calorieGoal * 0.3) / 4),
    carbG: Math.round((calorieGoal * 0.45) / 4),
    fatG: Math.round((calorieGoal * 0.25) / 9),
  };
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light (1–3 days/week)",
  moderate: "Moderate (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very Active (hard exercise, physical job)",
};
