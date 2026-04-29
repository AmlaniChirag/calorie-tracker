export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number; // per 100g
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSizeG: number; // default serving size in grams
  servingLabel: string;
  isCustom?: boolean;
  customId?: string;
}

export const FOOD_CATEGORIES = [
  "Indian Grains",
  "Indian Breakfast",
  "Indian Dal",
  "Indian Curry",
  "Indian Sabzi",
  "Indian Dishes",
  "Indian Dairy",
  "Indian Snacks",
  "Indian Beverages",
  "Indian Fats",
  "Protein",
  "Grains",
  "Fruits",
  "Vegetables",
  "Nuts",
  "Dairy",
  "Beverages",
];

export const BUILT_IN_FOODS: FoodItem[] = [
  // === Indian Grains & Breads ===
  { id: "roti-wheat", name: "Roti (Wheat)", category: "Indian Grains", calories: 297, protein: 8.5, carbs: 55, fat: 3.7, fiber: 3.2, servingSizeG: 40, servingLabel: "1 roti" },
  { id: "rice-white", name: "Rice (White, cooked)", category: "Indian Grains", calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "rice-brown", name: "Rice (Brown, cooked)", category: "Indian Grains", calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, fiber: 1.8, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "paratha-plain", name: "Paratha (Plain)", category: "Indian Grains", calories: 300, protein: 7.2, carbs: 42, fat: 11.2, fiber: 2.5, servingSizeG: 80, servingLabel: "1 paratha" },
  { id: "paratha-aloo", name: "Paratha (Aloo)", category: "Indian Grains", calories: 252, protein: 5.8, carbs: 38, fat: 8.8, fiber: 2.1, servingSizeG: 100, servingLabel: "1 paratha" },
  { id: "puri", name: "Puri", category: "Indian Grains", calories: 362, protein: 6.2, carbs: 42, fat: 18.5, fiber: 1.8, servingSizeG: 30, servingLabel: "1 puri" },
  { id: "naan", name: "Naan", category: "Indian Grains", calories: 310, protein: 9.3, carbs: 55, fat: 5.8, fiber: 1.5, servingSizeG: 90, servingLabel: "1 naan" },
  { id: "chapati-multigrain", name: "Chapati (Multigrain)", category: "Indian Grains", calories: 264, protein: 9.2, carbs: 47, fat: 4.8, fiber: 5.1, servingSizeG: 40, servingLabel: "1 chapati" },

  // === Indian Breakfast ===
  { id: "idli", name: "Idli", category: "Indian Breakfast", calories: 58, protein: 1.9, carbs: 11, fat: 0.4, fiber: 0.5, servingSizeG: 50, servingLabel: "1 idli" },
  { id: "dosa-plain", name: "Dosa (Plain)", category: "Indian Breakfast", calories: 168, protein: 4.2, carbs: 30, fat: 3.2, fiber: 1.2, servingSizeG: 100, servingLabel: "1 dosa" },
  { id: "upma", name: "Upma", category: "Indian Breakfast", calories: 154, protein: 3.8, carbs: 24, fat: 5.2, fiber: 2.1, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "poha", name: "Poha", category: "Indian Breakfast", calories: 130, protein: 2.4, carbs: 26, fat: 3.1, fiber: 1.5, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "uttapam", name: "Uttapam", category: "Indian Breakfast", calories: 195, protein: 5.6, carbs: 32, fat: 5.1, fiber: 1.8, servingSizeG: 100, servingLabel: "1 piece" },
  { id: "medu-vada", name: "Medu Vada", category: "Indian Breakfast", calories: 322, protein: 7.8, carbs: 38, fat: 15.2, fiber: 2.8, servingSizeG: 60, servingLabel: "1 vada" },

  // === Indian Dal & Legumes ===
  { id: "dal-toor", name: "Dal (Toor/Arhar)", category: "Indian Dal", calories: 105, protein: 7.2, carbs: 18, fat: 0.4, fiber: 4.2, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "dal-moong", name: "Dal (Moong)", category: "Indian Dal", calories: 97, protein: 7.0, carbs: 16, fat: 0.4, fiber: 4.5, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "dal-chana", name: "Dal (Chana/Bengal Gram)", category: "Indian Dal", calories: 164, protein: 8.9, carbs: 28, fat: 2.6, fiber: 7.6, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "dal-masoor", name: "Dal (Masoor/Red Lentil)", category: "Indian Dal", calories: 100, protein: 7.6, carbs: 17, fat: 0.4, fiber: 3.9, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "rajma", name: "Rajma (Kidney Beans)", category: "Indian Dal", calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "chole", name: "Chole (Chickpeas)", category: "Indian Dal", calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, servingSizeG: 150, servingLabel: "1 cup cooked" },
  { id: "moong-sprouts", name: "Moong Sprouts", category: "Indian Dal", calories: 30, protein: 3.0, carbs: 5.2, fat: 0.2, fiber: 2.0, servingSizeG: 100, servingLabel: "1 cup" },
  { id: "mixed-sprouts", name: "Mixed Sprouts (Matki, Moong)", category: "Indian Dal", calories: 42, protein: 3.8, carbs: 6.5, fat: 0.4, fiber: 2.8, servingSizeG: 100, servingLabel: "1 cup" },

  // === Indian Dairy ===
  { id: "paneer-plain", name: "Paneer (Fresh)", category: "Indian Dairy", calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "dahi", name: "Dahi (Curd/Yogurt)", category: "Indian Dairy", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.2, fiber: 0, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "lassi-plain", name: "Lassi (Plain)", category: "Indian Beverages", calories: 80, protein: 3.8, carbs: 9.2, fat: 2.8, fiber: 0, servingSizeG: 250, servingLabel: "1 glass" },
  { id: "chai", name: "Chai (with milk & sugar)", category: "Indian Beverages", calories: 65, protein: 2.2, carbs: 9.5, fat: 2.1, fiber: 0, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "milk-full-fat", name: "Milk (Full Fat)", category: "Dairy", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.5, fiber: 0, servingSizeG: 250, servingLabel: "1 glass" },
  { id: "ghee", name: "Ghee", category: "Indian Fats", calories: 900, protein: 0, carbs: 0, fat: 99.7, fiber: 0, servingSizeG: 10, servingLabel: "1 tsp" },

  // === Indian Curries ===
  { id: "palak-paneer", name: "Palak Paneer", category: "Indian Curry", calories: 178, protein: 9.8, carbs: 8.2, fat: 12.5, fiber: 2.8, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "matar-paneer", name: "Matar Paneer", category: "Indian Curry", calories: 195, protein: 9.5, carbs: 11.2, fat: 13.1, fiber: 3.2, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "dal-makhani", name: "Dal Makhani", category: "Indian Curry", calories: 200, protein: 9.2, carbs: 22, fat: 8.8, fiber: 5.5, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "butter-chicken", name: "Butter Chicken", category: "Indian Curry", calories: 194, protein: 16.8, carbs: 6.4, fat: 11.2, fiber: 0.8, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "chicken-curry", name: "Chicken Curry", category: "Indian Curry", calories: 185, protein: 18.2, carbs: 4.8, fat: 10.5, fiber: 1.2, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "egg-curry", name: "Egg Curry", category: "Indian Curry", calories: 165, protein: 11.2, carbs: 5.5, fat: 11.5, fiber: 1.2, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "fish-curry", name: "Fish Curry", category: "Indian Curry", calories: 160, protein: 14.5, carbs: 5.2, fat: 9.2, fiber: 0.8, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "malai-kofta", name: "Malai Kofta", category: "Indian Curry", calories: 242, protein: 7.2, carbs: 14.5, fat: 17.8, fiber: 1.5, servingSizeG: 200, servingLabel: "1 cup" },

  // === Indian Dishes ===
  { id: "biryani-chicken", name: "Chicken Biryani", category: "Indian Dishes", calories: 185, protein: 11.2, carbs: 24.8, fat: 5.2, fiber: 1.5, servingSizeG: 250, servingLabel: "1 cup" },
  { id: "biryani-veg", name: "Veg Biryani", category: "Indian Dishes", calories: 142, protein: 4.2, carbs: 26.5, fat: 3.2, fiber: 2.8, servingSizeG: 250, servingLabel: "1 cup" },
  { id: "khichdi", name: "Khichdi", category: "Indian Dishes", calories: 124, protein: 5.2, carbs: 22.5, fat: 2.4, fiber: 2.2, servingSizeG: 200, servingLabel: "1 cup" },
  { id: "dahi-vada", name: "Dahi Vada", category: "Indian Dishes", calories: 195, protein: 7.5, carbs: 26, fat: 7.2, fiber: 2.5, servingSizeG: 150, servingLabel: "2 pieces" },

  // === Indian Sabzi ===
  { id: "aloo-gobi", name: "Aloo Gobi", category: "Indian Sabzi", calories: 96, protein: 2.8, carbs: 14.5, fat: 4.2, fiber: 3.2, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "bhindi-masala", name: "Bhindi Masala", category: "Indian Sabzi", calories: 82, protein: 2.5, carbs: 9.8, fat: 4.1, fiber: 3.8, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "mixed-veg", name: "Mixed Veg Curry", category: "Indian Sabzi", calories: 88, protein: 3.2, carbs: 12, fat: 3.8, fiber: 3.5, servingSizeG: 150, servingLabel: "1 cup" },

  // === Indian Snacks ===
  { id: "samosa", name: "Samosa", category: "Indian Snacks", calories: 308, protein: 5.8, carbs: 38, fat: 15.2, fiber: 2.5, servingSizeG: 75, servingLabel: "1 samosa" },
  { id: "pav-bhaji", name: "Pav Bhaji (with pav)", category: "Indian Snacks", calories: 248, protein: 7.2, carbs: 38, fat: 7.8, fiber: 4.2, servingSizeG: 200, servingLabel: "1 serving" },
  { id: "bhel-puri", name: "Bhel Puri", category: "Indian Snacks", calories: 152, protein: 4.5, carbs: 28, fat: 3.2, fiber: 2.8, servingSizeG: 150, servingLabel: "1 cup" },

  // === Protein Sources ===
  { id: "chicken-breast", name: "Chicken Breast (Grilled)", category: "Protein", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "chicken-thigh", name: "Chicken Thigh (Grilled)", category: "Protein", calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "egg-whole", name: "Egg (Whole)", category: "Protein", calories: 155, protein: 13, carbs: 1.1, fat: 10.6, fiber: 0, servingSizeG: 60, servingLabel: "1 egg" },
  { id: "egg-white", name: "Egg White", category: "Protein", calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, servingSizeG: 60, servingLabel: "2 egg whites" },
  { id: "egg-boiled", name: "Egg (Hard Boiled)", category: "Protein", calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0, servingSizeG: 60, servingLabel: "1 egg" },
  { id: "salmon", name: "Salmon (Grilled)", category: "Protein", calories: 208, protein: 28, carbs: 0, fat: 9.8, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "tuna-canned", name: "Tuna (Canned in Water)", category: "Protein", calories: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "whey-protein", name: "Whey Protein (1 scoop)", category: "Protein", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, servingSizeG: 30, servingLabel: "1 scoop (30g)" },
  { id: "casein-protein", name: "Casein Protein (1 scoop)", category: "Protein", calories: 115, protein: 24, carbs: 3, fat: 1, fiber: 0, servingSizeG: 30, servingLabel: "1 scoop (30g)" },
  { id: "soy-protein", name: "Soy Protein (1 scoop)", category: "Protein", calories: 110, protein: 22, carbs: 4, fat: 1, fiber: 1, servingSizeG: 30, servingLabel: "1 scoop (30g)" },
  { id: "greek-yogurt", name: "Greek Yogurt (Plain)", category: "Protein", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "cottage-cheese", name: "Cottage Cheese (Low Fat)", category: "Protein", calories: 72, protein: 12.4, carbs: 2.7, fat: 1, fiber: 0, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "tofu-firm", name: "Tofu (Firm)", category: "Protein", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, servingSizeG: 100, servingLabel: "100g" },
  { id: "edamame", name: "Edamame (Cooked)", category: "Protein", calories: 121, protein: 11.9, carbs: 8.9, fat: 5.2, fiber: 5.2, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "quinoa", name: "Quinoa (Cooked)", category: "Protein", calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, servingSizeG: 185, servingLabel: "1 cup cooked" },
  { id: "peanut-butter", name: "Peanut Butter", category: "Protein", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, servingSizeG: 32, servingLabel: "2 tbsp" },
  { id: "turkey-breast", name: "Turkey Breast (Grilled)", category: "Protein", calories: 135, protein: 29, carbs: 0, fat: 1, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "beef-lean", name: "Lean Ground Beef (cooked)", category: "Protein", calories: 218, protein: 26, carbs: 0, fat: 11.8, fiber: 0, servingSizeG: 100, servingLabel: "100g" },
  { id: "shrimp-grilled", name: "Shrimp (Grilled)", category: "Protein", calories: 99, protein: 21, carbs: 0, fat: 0.7, fiber: 0, servingSizeG: 100, servingLabel: "100g" },

  // === Global Grains ===
  { id: "oats-rolled", name: "Oats (Rolled, cooked)", category: "Grains", calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, servingSizeG: 230, servingLabel: "1 cup cooked" },
  { id: "bread-white", name: "White Bread (Slice)", category: "Grains", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, servingSizeG: 30, servingLabel: "1 slice" },
  { id: "bread-brown", name: "Brown Bread (Slice)", category: "Grains", calories: 247, protein: 9.7, carbs: 41, fat: 3.4, fiber: 6.9, servingSizeG: 30, servingLabel: "1 slice" },
  { id: "pasta-cooked", name: "Pasta (Cooked)", category: "Grains", calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9, fiber: 1.8, servingSizeG: 200, servingLabel: "1 cup cooked" },

  // === Fruits ===
  { id: "banana", name: "Banana", category: "Fruits", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, servingSizeG: 120, servingLabel: "1 medium" },
  { id: "apple", name: "Apple", category: "Fruits", calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, servingSizeG: 180, servingLabel: "1 medium" },
  { id: "mango", name: "Mango", category: "Fruits", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, servingSizeG: 200, servingLabel: "1 cup sliced" },
  { id: "orange", name: "Orange", category: "Fruits", calories: 47, protein: 0.9, carbs: 11.7, fat: 0.1, fiber: 2.4, servingSizeG: 180, servingLabel: "1 medium" },
  { id: "watermelon", name: "Watermelon", category: "Fruits", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, servingSizeG: 280, servingLabel: "2 cups cubed" },
  { id: "grapes", name: "Grapes", category: "Fruits", calories: 67, protein: 0.6, carbs: 17.2, fat: 0.4, fiber: 0.9, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "papaya", name: "Papaya", category: "Fruits", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, servingSizeG: 200, servingLabel: "1 cup cubed" },
  { id: "guava", name: "Guava", category: "Fruits", calories: 68, protein: 2.6, carbs: 14.3, fat: 1, fiber: 5.4, servingSizeG: 100, servingLabel: "1 medium" },

  // === Vegetables ===
  { id: "sweet-potato", name: "Sweet Potato (Boiled)", category: "Vegetables", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, servingSizeG: 150, servingLabel: "1 medium" },
  { id: "corn-boiled", name: "Corn (Boiled)", category: "Vegetables", calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.7, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "broccoli", name: "Broccoli (Steamed)", category: "Vegetables", calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, servingSizeG: 150, servingLabel: "1 cup" },
  { id: "spinach", name: "Spinach (Raw)", category: "Vegetables", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, servingSizeG: 100, servingLabel: "1 cup" },

  // === Nuts & Seeds ===
  { id: "almonds", name: "Almonds", category: "Nuts", calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, servingSizeG: 28, servingLabel: "1 oz (~23 almonds)" },
  { id: "walnuts", name: "Walnuts", category: "Nuts", calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, servingSizeG: 28, servingLabel: "1 oz (~14 halves)" },
  { id: "cashews", name: "Cashews", category: "Nuts", calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3, servingSizeG: 28, servingLabel: "1 oz (~18 cashews)" },
  { id: "peanuts", name: "Peanuts (Roasted)", category: "Nuts", calories: 585, protein: 23.7, carbs: 21.5, fat: 49.2, fiber: 8.5, servingSizeG: 28, servingLabel: "1 oz" },
  { id: "chia-seeds", name: "Chia Seeds", category: "Nuts", calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, servingSizeG: 28, servingLabel: "2 tbsp" },
  { id: "flax-seeds", name: "Flaxseeds (Ground)", category: "Nuts", calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, servingSizeG: 14, servingLabel: "1 tbsp" },
];

export function searchFoods(query: string, customFoods: FoodItem[] = []): FoodItem[] {
  const all = [...BUILT_IN_FOODS, ...customFoods];
  if (!query.trim()) return all.slice(0, 20);
  const q = query.toLowerCase();
  return all
    .filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    )
    .slice(0, 30);
}

export function calcServingNutrition(food: FoodItem, multiplier: number) {
  const factor = (food.servingSizeG / 100) * multiplier;
  return {
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fat: Math.round(food.fat * factor * 10) / 10,
    fiber: Math.round(food.fiber * factor * 10) / 10,
  };
}
