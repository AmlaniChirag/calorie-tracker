"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, ScanLine, Plus, Trash2, Star, Clock } from "lucide-react";
import { BUILT_IN_FOODS, searchFoods, type FoodItem } from "@/lib/foods";
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

type Tab = "search" | "custom" | "add-custom";
type Unit = "g" | "ml" | "piece" | "cup" | "tbsp" | "tsp" | "oz";

const UNIT_TO_G: Record<Unit, number> = {
  g: 1, ml: 1, cup: 240, tbsp: 15, tsp: 5, oz: 28.35, piece: 1,
};

const UNIT_OPTIONS: Unit[] = ["g", "ml", "piece", "cup", "tbsp", "tsp", "oz"];

function calcNutrition(food: FoodItem, grams: number) {
  const f = Math.max(0, grams) / 100;
  return {
    calories: Math.round(food.calories * f),
    protein: Math.round(food.protein * f * 10) / 10,
    carbs: Math.round(food.carbs * f * 10) / 10,
    fat: Math.round(food.fat * f * 10) / 10,
    fiber: Math.round(food.fiber * f * 10) / 10,
  };
}

function getGrams(qty: number, unit: Unit, servingSizeG: number): number {
  if (unit === "piece") return qty * servingSizeG;
  return qty * UNIT_TO_G[unit];
}

export default function FoodSearchModal({ mealType, date, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>(BUILT_IN_FOODS.slice(0, 20));
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState(100);
  const [unit, setUnit] = useState<Unit>("g");
  const [showScanner, setShowScanner] = useState(false);
  const [adding, setAdding] = useState(false);
  const [scanToast, setScanToast] = useState("");

  // Custom food form
  const [cf, setCf] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "", servingSize: "100", servingUnit: "g" as Unit });
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
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadCustomFoods(); }, [loadCustomFoods]);

  // Load recent foods from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentFoods");
      if (raw) setRecentFoods(JSON.parse(raw));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (tab === "search") {
      setResults(searchFoods(query, customFoods));
    }
  }, [query, tab, customFoods]);

  const selectFood = (food: FoodItem) => {
    setSelected(food);
    setQty(food.servingSizeG || 100);
    setUnit("g");
  };

  const grams = selected ? getGrams(qty, unit, selected.servingSizeG) : 0;
  const nutrition = selected ? calcNutrition(selected, grams) : null;

  const handleAdd = async () => {
    if (!selected || !nutrition) return;
    setAdding(true);
    try {
      await onAdd({ mealType, date, foodName: selected.name, servingSize: grams, ...nutrition });
      // Save to recent foods
      try {
        const recent: FoodItem[] = JSON.parse(localStorage.getItem("recentFoods") || "[]");
        const updated = [selected, ...recent.filter((f) => f.id !== selected.id)].slice(0, 8);
        localStorage.setItem("recentFoods", JSON.stringify(updated));
      } catch { /* silent */ }
      onClose();
    } finally {
      setAdding(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!cf.name || !cf.calories) return;
    setCfSaving(true);
    try {
      const servingSizeG = cf.servingUnit === "piece"
        ? Number(cf.servingSize) || 100
        : (Number(cf.servingSize) || 100) * UNIT_TO_G[cf.servingUnit];
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
      setCf({ name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "", servingSize: "100", servingUnit: "g" });
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

  const handleBarcodeFound = async (food: FoodItem) => {
    // Auto-save scanned food to My Foods
    try {
      await fetch("/api/food/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
        }),
      });
      await loadCustomFoods();
      setScanToast(`"${food.name.slice(0, 30)}" saved to My Foods`);
      setTimeout(() => setScanToast(""), 3000);
    } catch { /* non-critical */ }

    setShowScanner(false);
    setResults((prev) => prev.some((f) => f.id === food.id) ? prev : [food, ...prev]);
    selectFood(food);
    setTab("search");
    setQuery("");
  };

  const macroTotal = nutrition ? nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9 : 0;
  const macroBarP = macroTotal > 0 ? (nutrition!.protein * 4 / macroTotal) * 100 : 33;
  const macroBarC = macroTotal > 0 ? (nutrition!.carbs * 4 / macroTotal) * 100 : 34;
  const macroBarF = macroTotal > 0 ? (nutrition!.fat * 9 / macroTotal) * 100 : 33;

  const displayList = tab === "search"
    ? (query ? results : (recentFoods.length > 0 ? [...recentFoods, ...BUILT_IN_FOODS.slice(0, 15)] : results))
    : [];

  return (
    <>
      <div className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="surface rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
            <h2 className="font-semibold capitalize">Add to {mealType}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowScanner(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-green-600" title="Scan barcode">
                <ScanLine size={18} />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scan toast */}
          {scanToast && (
            <div className="mx-4 mt-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-600 flex items-center gap-2">
              <ScanLine size={13} /> {scanToast}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-[rgb(var(--border))] px-4">
            {(["search", "custom", "add-custom"] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setSelected(null); }}
                className={`py-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-green-500 text-green-600" : "border-transparent text-muted"}`}>
                {t === "search" ? "Search" : t === "custom" ? "My Foods" : "+ Custom"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── Search tab ── */}
            {tab === "search" && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-[rgb(var(--border))]">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
                    <Search size={16} className="text-muted flex-shrink-0" />
                    <input autoFocus type="text" placeholder="Search foods (roti, chicken, banana)..."
                      value={query} onChange={(e) => setQuery(e.target.value)}
                      className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted" />
                    {query && <button onClick={() => setQuery("")} className="text-muted"><X size={14} /></button>}
                  </div>
                </div>

                {!query && recentFoods.length > 0 && (
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-xs font-medium text-muted flex items-center gap-1 mb-2"><Clock size={12} /> Recent</p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto">
                  {displayList.map((food, i) => (
                    <button key={`${food.id}-${i}`} onClick={() => selectFood(food)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors border-b border-[rgb(var(--border))] ${selected?.id === food.id ? "bg-green-50 dark:bg-green-950/30" : ""}`}>
                      <div className="text-left">
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {!query && recentFoods.some((r) => r.id === food.id) && <Clock size={11} className="text-muted" />}
                          {food.name}
                        </p>
                        <p className="text-xs text-muted">{food.category} · {food.servingLabel}</p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <p className="font-semibold text-sm text-[rgb(var(--text))]">{Math.round(food.calories * food.servingSizeG / 100)} kcal</p>
                        <p>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </div>
                    </button>
                  ))}
                  {query && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted text-sm gap-2">
                      <span className="text-3xl">🔍</span>
                      <p>No results for &ldquo;{query}&rdquo;</p>
                      <button onClick={() => setTab("add-custom")} className="text-green-600 underline text-xs">Add as custom food</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── My Foods tab ── */}
            {tab === "custom" && (
              <div className="flex flex-col">
                {customFoods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted text-sm gap-2">
                    <span className="text-3xl">🍽️</span>
                    <p>No custom foods yet</p>
                    <p className="text-xs">Scanned barcodes auto-save here</p>
                    <button onClick={() => setTab("add-custom")} className="text-green-600 underline text-xs mt-1">Add your first food</button>
                  </div>
                ) : customFoods.map((food) => (
                  <div key={food.id} className={`flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-zinc-800/60 ${selected?.id === food.id ? "bg-green-50 dark:bg-green-950/30" : ""}`}>
                    <button className="text-left flex-1" onClick={() => selectFood(food)}>
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-muted">per 100g · P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{food.calories} kcal</span>
                      <button onClick={() => food.customId && handleDeleteCustom(food.customId)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Add Custom tab ── */}
            {tab === "add-custom" && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted">Nutrition values per 100g / 100ml of the food.</p>
                {[
                  { key: "name", label: "Food Name", type: "text", placeholder: "e.g. Milld Atta" },
                  { key: "calories", label: "Calories (kcal per 100g)", type: "number", placeholder: "e.g. 340" },
                  { key: "protein", label: "Protein (g)", type: "number", placeholder: "e.g. 12" },
                  { key: "carbs", label: "Carbs (g)", type: "number", placeholder: "e.g. 65" },
                  { key: "fat", label: "Fat (g)", type: "number", placeholder: "e.g. 2.5" },
                  { key: "fiber", label: "Fiber (g)", type: "number", placeholder: "e.g. 3" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1">{label}</label>
                    <input type={type} placeholder={placeholder}
                      value={cf[key as keyof typeof cf]}
                      onChange={(e) => setCf((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                ))}
                <button onClick={handleSaveCustom} disabled={!cf.name || !cf.calories || cfSaving}
                  className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm disabled:opacity-50 transition-colors">
                  {cfSaving ? "Saving..." : "Save to My Foods"}
                </button>
              </div>
            )}
          </div>

          {/* ── Serving + Add panel ── */}
          {selected && nutrition && (tab === "search" || tab === "custom") && (
            <div className="border-t border-[rgb(var(--border))] p-4 space-y-3 bg-[rgb(var(--surface))]">
              {/* Food name + calories */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{selected.name}</p>
                  <p className="text-xs text-muted">{Math.round(grams)}g · {selected.servingLabel} = {selected.servingSizeG}g</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">{nutrition.calories} kcal</p>
                  <p className="text-xs text-muted">P:{nutrition.protein}g C:{nutrition.carbs}g F:{nutrition.fat}g</p>
                </div>
              </div>

              {/* Macro bar */}
              <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                <div className="bg-blue-400 rounded-full transition-all" style={{ width: `${macroBarP}%` }} />
                <div className="bg-yellow-400 rounded-full transition-all" style={{ width: `${macroBarC}%` }} />
                <div className="bg-red-400 rounded-full transition-all" style={{ width: `${macroBarF}%` }} />
              </div>
              <div className="flex gap-3 text-xs text-muted justify-center">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full" />Protein</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full" />Carbs</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Fat</span>
              </div>

              {/* Qty + Unit */}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Serving size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={qty}
                    onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
                    className="w-24 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400 text-center font-semibold"
                  />
                  <div className="flex gap-1 flex-wrap flex-1">
                    {UNIT_OPTIONS.map((u) => (
                      <button key={u} onClick={() => {
                        setUnit(u);
                        if (u === "piece") setQty(1);
                        else if (u === "g" || u === "ml") setQty(selected.servingSizeG || 100);
                        else if (u === "cup") setQty(1);
                        else if (u === "tbsp") setQty(1);
                        else if (u === "tsp") setQty(1);
                        else if (u === "oz") setQty(Math.round((selected.servingSizeG || 100) / 28.35 * 10) / 10);
                      }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${unit === u ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))] text-muted hover:border-green-400"}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {unit === "piece" && (
                  <p className="text-xs text-muted mt-1">1 piece = {selected.servingSizeG}g ({selected.servingLabel})</p>
                )}
              </div>

              <button onClick={handleAdd} disabled={adding || grams <= 0}
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <Plus size={18} />
                {adding ? "Adding..." : `Add ${Math.round(grams)}g of ${selected.name.split(" ").slice(0, 3).join(" ")}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner onFound={handleBarcodeFound} onClose={() => setShowScanner(false)} />
      )}
    </>
  );
}
