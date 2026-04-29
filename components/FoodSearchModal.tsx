"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Search, ScanLine, Plus, Trash2 } from "lucide-react";
import { BUILT_IN_FOODS, searchFoods, calcServingNutrition, type FoodItem } from "@/lib/foods";
import BarcodeScanner from "./BarcodeScanner";

interface Props {
  mealType: string;
  date: string;
  onAdd: (meal: {
    mealType: string; date: string; foodName: string; servingSize: number;
    calories: number; protein: number; carbs: number; fat: number; fiber: number;
  }) => Promise<void>;
  onClose: () => void;
}

const SERVING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

type Tab = "search" | "custom" | "add-custom";

export default function FoodSearchModal({ mealType, date, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>(BUILT_IN_FOODS.slice(0, 20));
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [adding, setAdding] = useState(false);

  // Custom food form
  const [cf, setCf] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "" });
  const [cfSaving, setCfSaving] = useState(false);

  const loadCustomFoods = useCallback(async () => {
    try {
      const res = await fetch("/api/food/custom");
      const data = await res.json();
      const mapped: FoodItem[] = data.map((f: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; fiber: number }) => ({
        id: `custom-${f.id}`,
        customId: f.id,
        name: f.name,
        category: "My Foods",
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        fiber: f.fiber,
        servingSizeG: 100,
        servingLabel: "100g",
        isCustom: true,
      }));
      setCustomFoods(mapped);
    } catch {}
  }, []);

  useEffect(() => { loadCustomFoods(); }, [loadCustomFoods]);

  useEffect(() => {
    if (tab === "search") {
      setResults(searchFoods(query, customFoods));
    }
  }, [query, tab, customFoods]);

  const nutrition = selected ? calcServingNutrition(selected, multiplier) : null;

  const handleAdd = async () => {
    if (!selected || !nutrition) return;
    setAdding(true);
    try {
      await onAdd({
        mealType, date,
        foodName: selected.name,
        servingSize: multiplier,
        ...nutrition,
      });
      onClose();
    } finally {
      setAdding(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!cf.name || !cf.calories) return;
    setCfSaving(true);
    try {
      await fetch("/api/food/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cf.name,
          calories: Number(cf.calories),
          protein: Number(cf.protein || 0),
          carbs: Number(cf.carbs || 0),
          fat: Number(cf.fat || 0),
          fiber: Number(cf.fiber || 0),
        }),
      });
      setCf({ name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "" });
      await loadCustomFoods();
      setTab("custom");
    } finally {
      setCfSaving(false);
    }
  };

  const handleDeleteCustom = async (customId: string) => {
    await fetch(`/api/food/custom/${customId}`, { method: "DELETE" });
    await loadCustomFoods();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center" onClick={onClose}>
        <div
          className="surface rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
            <h2 className="font-semibold capitalize">Add to {mealType}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-green-600"
                title="Scan barcode"
              >
                <ScanLine size={18} />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[rgb(var(--border))] px-4">
            {(["search", "custom", "add-custom"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelected(null); }}
                className={`py-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-muted"
                }`}
              >
                {t === "search" ? "Search" : t === "custom" ? "My Foods" : "Add Custom"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Search tab */}
            {tab === "search" && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-[rgb(var(--border))]">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
                    <Search size={16} className="text-muted flex-shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search foods (e.g. roti, chicken, banana)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {results.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => { setSelected(food); setMultiplier(1); }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors border-b border-[rgb(var(--border))] ${
                        selected?.id === food.id ? "bg-green-50 dark:bg-green-950/30" : ""
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium">{food.name}</p>
                        <p className="text-xs text-muted">{food.category} · {food.servingLabel}</p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <p className="font-semibold text-sm text-[rgb(var(--text))]">
                          {Math.round(food.calories * food.servingSizeG / 100)} kcal
                        </p>
                        <p>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </div>
                    </button>
                  ))}
                  {results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted text-sm gap-2">
                      <span className="text-3xl">🔍</span>
                      <p>No results for &ldquo;{query}&rdquo;</p>
                      <button onClick={() => setTab("add-custom")} className="text-green-600 underline text-xs">
                        Add it as custom food
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Foods tab */}
            {tab === "custom" && (
              <div className="flex flex-col">
                {customFoods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted text-sm gap-2">
                    <span className="text-3xl">🍽️</span>
                    <p>No custom foods yet</p>
                    <button onClick={() => setTab("add-custom")} className="text-green-600 underline text-xs">
                      Add your first custom food
                    </button>
                  </div>
                ) : (
                  customFoods.map((food) => (
                    <div
                      key={food.id}
                      className={`flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-zinc-800/60 ${
                        selected?.id === food.id ? "bg-green-50 dark:bg-green-950/30" : ""
                      }`}
                    >
                      <button className="text-left flex-1" onClick={() => { setSelected(food); setMultiplier(1); }}>
                        <p className="text-sm font-medium">{food.name}</p>
                        <p className="text-xs text-muted">per 100g · P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{food.calories} kcal</span>
                        <button
                          onClick={() => food.customId && handleDeleteCustom(food.customId)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Custom tab */}
            {tab === "add-custom" && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted">All values are per 100g of the food.</p>
                {[
                  { key: "name", label: "Food Name", type: "text", placeholder: "e.g. Dal Tadka" },
                  { key: "calories", label: "Calories (kcal)", type: "number", placeholder: "e.g. 120" },
                  { key: "protein", label: "Protein (g)", type: "number", placeholder: "e.g. 7.5" },
                  { key: "carbs", label: "Carbs (g)", type: "number", placeholder: "e.g. 18" },
                  { key: "fat", label: "Fat (g)", type: "number", placeholder: "e.g. 3.2" },
                  { key: "fiber", label: "Fiber (g)", type: "number", placeholder: "e.g. 2.1" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={cf[key as keyof typeof cf]}
                      onChange={(e) => setCf((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSaveCustom}
                  disabled={!cf.name || !cf.calories || cfSaving}
                  className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  {cfSaving ? "Saving..." : "Save Custom Food"}
                </button>
              </div>
            )}
          </div>

          {/* Serving selector + Add button (shown when food is selected) */}
          {selected && nutrition && (tab === "search" || tab === "custom") && (
            <div className="border-t border-[rgb(var(--border))] p-4 space-y-3 bg-[rgb(var(--surface))]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm truncate max-w-[180px]">{selected.name}</p>
                  <p className="text-xs text-muted">{selected.servingLabel} = 1 serving</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{nutrition.calories} kcal</p>
                  <p className="text-xs text-muted">P:{nutrition.protein}g C:{nutrition.carbs}g F:{nutrition.fat}g</p>
                </div>
              </div>

              {/* Serving size */}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Serving size</label>
                <div className="flex gap-2 flex-wrap">
                  {SERVING_STEPS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setMultiplier(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        multiplier === s
                          ? "bg-green-500 text-white border-green-500"
                          : "border-[rgb(var(--border))] text-muted hover:border-green-400"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={adding}
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {adding ? "Adding..." : `Add ${multiplier}× ${selected.servingLabel}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onFound={(food) => {
            setShowScanner(false);
            setSelected(food);
            setMultiplier(1);
            setTab("search");
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
