// ── Micronutrient data & utilities ──
// All food values are per 100g. RDAs are general adult averages (M/F).

export interface MicroData {
  iron_mg?: number;
  calcium_mg?: number;
  vitC_mg?: number;
  vitD_mcg?: number;
  vitB12_mcg?: number;
  potassium_mg?: number;
  magnesium_mg?: number;
  zinc_mg?: number;
}

export type MicroKey = keyof MicroData;

export const MICRO_META: Record<MicroKey, { label: string; unit: string; rda: number; color: string; darkColor: string }> = {
  iron_mg:      { label: "Iron",        unit: "mg",  rda: 15,   color: "bg-red-500",    darkColor: "bg-red-400" },
  calcium_mg:   { label: "Calcium",     unit: "mg",  rda: 1000, color: "bg-slate-500",  darkColor: "bg-slate-300" },
  vitC_mg:      { label: "Vitamin C",   unit: "mg",  rda: 80,   color: "bg-orange-500", darkColor: "bg-orange-400" },
  vitD_mcg:     { label: "Vitamin D",   unit: "mcg", rda: 15,   color: "bg-yellow-500", darkColor: "bg-yellow-400" },
  vitB12_mcg:   { label: "Vitamin B12", unit: "mcg", rda: 2.4,  color: "bg-purple-500", darkColor: "bg-purple-400" },
  potassium_mg: { label: "Potassium",   unit: "mg",  rda: 3500, color: "bg-green-500",  darkColor: "bg-green-400" },
  magnesium_mg: { label: "Magnesium",   unit: "mg",  rda: 350,  color: "bg-teal-500",   darkColor: "bg-teal-400" },
  zinc_mg:      { label: "Zinc",        unit: "mg",  rda: 10,   color: "bg-blue-500",   darkColor: "bg-blue-400" },
};

export const MICRO_KEYS: MicroKey[] = [
  "iron_mg", "calcium_mg", "vitC_mg", "vitD_mcg",
  "vitB12_mcg", "potassium_mg", "magnesium_mg", "zinc_mg",
];

// ── Per-food micro data (per 100g), keyed by food ID ──
export const FOOD_MICROS: Record<string, MicroData> = {
  // Protein sources
  "chicken-breast": { iron_mg: 0.7,  potassium_mg: 256, zinc_mg: 1.0,  vitB12_mcg: 0.3 },
  "chicken-thigh":  { iron_mg: 0.9,  potassium_mg: 220, zinc_mg: 1.8,  vitB12_mcg: 0.4 },
  "egg-whole":      { iron_mg: 1.2,  calcium_mg: 50,    vitD_mcg: 2.0, vitB12_mcg: 0.9, zinc_mg: 1.3 },
  "egg-white":      { iron_mg: 0.1,  vitB12_mcg: 0.1,   zinc_mg: 0.03 },
  "egg-boiled":     { iron_mg: 1.2,  calcium_mg: 50,    vitD_mcg: 2.0, vitB12_mcg: 0.9, zinc_mg: 1.3 },
  "salmon":         { vitD_mcg: 11,  vitB12_mcg: 3.2,   potassium_mg: 363, zinc_mg: 0.6, iron_mg: 0.3 },
  "tuna-canned":    { vitD_mcg: 4.0, vitB12_mcg: 2.1,   potassium_mg: 207, zinc_mg: 0.8 },
  "beef-lean":      { iron_mg: 2.6,  zinc_mg: 4.8,      vitB12_mcg: 2.5,   potassium_mg: 270 },
  "turkey-breast":  { iron_mg: 0.8,  zinc_mg: 1.4,      vitB12_mcg: 0.5,   potassium_mg: 292 },
  "shrimp-grilled": { iron_mg: 0.5,  zinc_mg: 1.1,      vitB12_mcg: 1.1,   calcium_mg: 64 },
  "tofu-firm":      { calcium_mg: 350, iron_mg: 1.6,    magnesium_mg: 30,  zinc_mg: 0.8 },
  "edamame":        { calcium_mg: 63,  iron_mg: 2.3,    magnesium_mg: 64,  zinc_mg: 1.4, potassium_mg: 436, vitC_mg: 6 },
  "greek-yogurt":   { calcium_mg: 115, vitB12_mcg: 0.75, potassium_mg: 141, magnesium_mg: 12, zinc_mg: 0.7 },
  "cottage-cheese": { calcium_mg: 83,  vitB12_mcg: 0.4,  potassium_mg: 84,  zinc_mg: 0.5 },
  "quinoa":         { iron_mg: 1.5,  magnesium_mg: 64,  zinc_mg: 1.1,      potassium_mg: 172 },
  "peanut-butter":  { iron_mg: 1.7,  magnesium_mg: 170, zinc_mg: 2.9,      potassium_mg: 649 },
  "whey-protein":   { calcium_mg: 120, iron_mg: 0.5,    zinc_mg: 1.2 },
  "casein-protein": { calcium_mg: 140, iron_mg: 0.4,    zinc_mg: 1.1 },
  "soy-protein":    { calcium_mg: 100, iron_mg: 3.5,    zinc_mg: 2.0,      magnesium_mg: 60 },

  // Indian dairy
  "paneer-plain":   { calcium_mg: 480, zinc_mg: 2.7,    iron_mg: 0.2 },
  "dahi":           { calcium_mg: 110, vitB12_mcg: 0.3, potassium_mg: 155 },
  "milk-full-fat":  { calcium_mg: 120, vitD_mcg: 1.0,   vitB12_mcg: 0.4,   potassium_mg: 150, magnesium_mg: 11 },
  "lassi-plain":    { calcium_mg: 90,  vitB12_mcg: 0.25 },

  // Indian dal & legumes
  "dal-toor":       { iron_mg: 1.8, potassium_mg: 400, magnesium_mg: 48, zinc_mg: 1.1 },
  "dal-masoor":     { iron_mg: 3.3, potassium_mg: 369, magnesium_mg: 36, zinc_mg: 1.3 },
  "dal-moong":      { iron_mg: 1.4, potassium_mg: 266, magnesium_mg: 45, zinc_mg: 1.0 },
  "dal-chana":      { iron_mg: 2.9, calcium_mg: 49,    potassium_mg: 291, zinc_mg: 1.5, magnesium_mg: 48 },
  "rajma":          { iron_mg: 2.1, calcium_mg: 28,    potassium_mg: 405, zinc_mg: 1.0, magnesium_mg: 45 },
  "chole":          { iron_mg: 2.9, calcium_mg: 49,    potassium_mg: 291, zinc_mg: 1.5, magnesium_mg: 48 },
  "moong-sprouts":  { iron_mg: 0.9, vitC_mg: 13,       potassium_mg: 149 },
  "mixed-sprouts":  { iron_mg: 1.1, vitC_mg: 9,        potassium_mg: 172 },

  // Vegetables
  "spinach":        { iron_mg: 2.7, calcium_mg: 99,  vitC_mg: 28,  potassium_mg: 558, magnesium_mg: 79 },
  "broccoli":       { vitC_mg: 89,  calcium_mg: 47,  iron_mg: 0.7, potassium_mg: 316, magnesium_mg: 21 },
  "sweet-potato":   { vitC_mg: 20,  potassium_mg: 337, magnesium_mg: 27 },
  "corn-boiled":    { vitC_mg: 7,   potassium_mg: 270, magnesium_mg: 26 },

  // Fruits
  "banana":         { potassium_mg: 358, magnesium_mg: 27,  vitC_mg: 9 },
  "orange":         { vitC_mg: 53,  potassium_mg: 181,  calcium_mg: 40, magnesium_mg: 10 },
  "guava":          { vitC_mg: 228, potassium_mg: 417,  magnesium_mg: 22 },
  "papaya":         { vitC_mg: 62,  potassium_mg: 182 },
  "mango":          { vitC_mg: 36,  potassium_mg: 168 },
  "watermelon":     { vitC_mg: 8,   potassium_mg: 112 },
  "apple":          { vitC_mg: 4.6, potassium_mg: 107 },
  "grapes":         { vitC_mg: 3.2, potassium_mg: 191 },

  // Global grains
  "oats-rolled":    { iron_mg: 4.7, magnesium_mg: 138, zinc_mg: 4.0, potassium_mg: 429 },
  "bread-brown":    { iron_mg: 2.4, calcium_mg: 73,    potassium_mg: 247, magnesium_mg: 42 },

  // Nuts & seeds
  "almonds":        { calcium_mg: 264, magnesium_mg: 270, zinc_mg: 3.1, iron_mg: 3.7, potassium_mg: 733 },
  "chia-seeds":     { calcium_mg: 631, iron_mg: 7.7,      magnesium_mg: 335, zinc_mg: 4.6, potassium_mg: 407 },
  "flax-seeds":     { calcium_mg: 255, iron_mg: 5.7,      magnesium_mg: 392, potassium_mg: 813 },
  "cashews":        { magnesium_mg: 292, zinc_mg: 5.6,    iron_mg: 6.7, potassium_mg: 660 },
  "peanuts":        { magnesium_mg: 168, zinc_mg: 3.3,    iron_mg: 2.2, potassium_mg: 705 },
  "walnuts":        { magnesium_mg: 158, zinc_mg: 3.1,    iron_mg: 2.9, potassium_mg: 441 },
};

// Build food-name → MicroData map from foods list + FOOD_MICROS
// Pass BUILT_IN_FOODS lazily to avoid circular imports
export function buildNameMicrosMap(
  foods: Array<{ id: string; name: string }>
): Record<string, MicroData> {
  const map: Record<string, MicroData> = {};
  for (const food of foods) {
    const m = FOOD_MICROS[food.id];
    if (m) map[food.name] = m;
  }
  return map;
}

// Aggregate micros from logged meals
export function aggregateMicros(
  meals: Array<{ foodName: string; servingSize: number }>,
  nameMicrosMap: Record<string, MicroData>
): Partial<Record<MicroKey, number>> {
  const totals: Partial<Record<MicroKey, number>> = {};
  for (const meal of meals) {
    const micros = nameMicrosMap[meal.foodName];
    if (!micros) continue;
    const factor = meal.servingSize / 100;
    for (const key of MICRO_KEYS) {
      const val = micros[key];
      if (val !== undefined) {
        totals[key] = (totals[key] ?? 0) + val * factor;
      }
    }
  }
  return totals;
}

export function fmtMicro(val: number, unit: string): string {
  if (unit === "mcg") return val < 10 ? val.toFixed(1) : Math.round(val).toString();
  return val < 10 ? val.toFixed(1) : Math.round(val).toString();
}
