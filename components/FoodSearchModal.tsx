"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Search, ScanLine, Plus, Trash2, Star, Clock, Zap } from "lucide-react";
import { BUILT_IN_FOODS, searchFoods, type FoodItem } from "@/lib/foods";
import BarcodeScanner from "./BarcodeScanner";
import TemplateTab, { type TemplateItem } from "./TemplateTab";

interface Props {
  mealType: string;
  date: string;
  onAdd: (meal: {
    mealType: string; date: string; foodName: string; servingSize: number;
    calories: number; protein: number; carbs: number; fat: number; fiber: number;
  }) => Promise<void>;
  onClose: () => void;
}

type Tab = "search" | "saved" | "templates" | "add-custom";
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

function getGrams(qty: number, unit: Unit, servingSizeG: number) {
  return unit === "piece" ? qty * servingSizeG : qty * UNIT_TO_G[unit];
}

function loadFavs(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem("favFoods_v1") || "[]")); }
  catch { return new Set(); }
}
function saveFavs(favs: Set<string>) {
  localStorage.setItem("favFoods_v1", JSON.stringify([...favs]));
}

export default function FoodSearchModal({ mealType, date, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>(BUILT_IN_FOODS.slice(0, 20));
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState(100);
  const [unit, setUnit] = useState<Unit>("g");
  const [showScanner, setShowScanner] = useState(false);
  const [adding, setAdding] = useState(false);
  const [scanToast, setScanToast] = useState("");

  // Quick-add state
  const [showQA, setShowQA] = useState(false);
  const [qa, setQa] = useState({ name: "Quick Add", calories: "", protein: "", carbs: "", fat: "" });
  const [qaAdding, setQaAdding] = useState(false);

  // Custom food form
  const [cf, setCf] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "" });
  const [cfSaving, setCfSaving] = useState(false);

  // Load persistent data
  useEffect(() => {
    setFavorites(loadFavs());
    try {
      const raw = localStorage.getItem("recentFoods_v1");
      if (raw) setRecentFoods(JSON.parse(raw));
    } catch { /* silent */ }
  }, []);

  const loadCustomFoods = useCallback(async () => {
    try {
      const res = await fetch("/api/food/custom");
      const data = await res.json();
      setCustomFoods(data.map((f: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; fiber: number }) => ({
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
      })));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadCustomFoods(); }, [loadCustomFoods]);

  useEffect(() => {
    if (tab === "search") setResults(searchFoods(query, customFoods));
  }, [query, tab, customFoods]);

  const toggleFav = (foodId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(foodId) ? next.delete(foodId) : next.add(foodId);
      saveFavs(next);
      return next;
    });
  };

  const selectFood = (food: FoodItem) => {
    setSelected(food);
    setQty(food.servingSizeG || 100);
    setUnit("g");
  };

  // Build ordered display list: favorites → recents → rest
  const displayList = (() => {
    if (query) return results;
    const pool = [...customFoods, ...BUILT_IN_FOODS];
    const favItems = pool.filter((f) => favorites.has(f.id));
    const recentItems = recentFoods.filter((f) => !favorites.has(f.id));
    const rest = BUILT_IN_FOODS.slice(0, 20).filter(
      (f) => !favorites.has(f.id) && !recentFoods.some((r) => r.id === f.id)
    );
    return [...favItems, ...recentItems, ...rest];
  })();

  const grams = selected ? getGrams(qty, unit, selected.servingSizeG) : 0;
  const nutrition = selected ? calcNutrition(selected, grams) : null;
  const macroTotal = nutrition ? nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9 : 0;

  const handleAdd = async () => {
    if (!selected || !nutrition) return;
    setAdding(true);
    try {
      await onAdd({ mealType, date, foodName: selected.name, servingSize: grams, ...nutrition });
      // Save to recents
      try {
        const updated = [selected, ...recentFoods.filter((f) => f.id !== selected.id)].slice(0, 8);
        localStorage.setItem("recentFoods_v1", JSON.stringify(updated));
      } catch { /* silent */ }
      onClose();
    } finally { setAdding(false); }
  };

  const handleQuickAdd = async () => {
    if (!qa.calories) return;
    setQaAdding(true);
    try {
      await onAdd({
        mealType, date,
        foodName: qa.name || "Quick Add",
        servingSize: 1,
        calories: Number(qa.calories),
        protein: Number(qa.protein || 0),
        carbs: Number(qa.carbs || 0),
        fat: Number(qa.fat || 0),
        fiber: 0,
      });
      onClose();
    } finally { setQaAdding(false); }
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
      setTab("saved");
    } finally { setCfSaving(false); }
  };

  const handleDeleteCustom = async (customId: string) => {
    await fetch(`/api/food/custom/${customId}`, { method: "DELETE" });
    await loadCustomFoods();
  };

  const handleBarcodeFound = async (food: FoodItem) => {
    // Auto-save to My Foods
    try {
      await fetch("/api/food/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: food.name, calories: food.calories, protein: food.protein,
          carbs: food.carbs, fat: food.fat, fiber: food.fiber,
        }),
      });
      await loadCustomFoods();
      setScanToast(`"${food.name.slice(0, 28)}" saved to My Foods`);
      setTimeout(() => setScanToast(""), 3000);
    } catch { /* non-critical */ }

    setShowScanner(false);
    setResults((prev) => prev.some((f) => f.id === food.id) ? prev : [food, ...prev]);
    selectFood(food);
    setTab("search");
    setQuery("");
  };

  const handleApplyTemplate = async (items: TemplateItem[]) => {
    for (const item of items) {
      await onAdd({
        mealType, date,
        foodName: item.foodName,
        servingSize: item.grams,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
      });
    }
    onClose();
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "search", label: "Search" },
    { key: "saved", label: "My Foods" },
    { key: "templates", label: "Templates" },
    { key: "add-custom", label: "+ Custom" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="surface rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
            <h2 className="font-semibold capitalize">Add to {mealType}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowQA((v) => !v); setSelected(null); }}
                title="Quick add calories"
                className={`p-2 rounded-xl text-sm transition-colors ${showQA ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-amber-500"}`}
              >
                <Zap size={17} />
              </button>
              <button onClick={() => setShowScanner(true)} title="Scan barcode"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-green-600">
                <ScanLine size={17} />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick Add panel */}
          {showQA && (
            <div className="px-4 py-3 border-b border-[rgb(var(--border))] bg-amber-50/50 dark:bg-amber-900/10 space-y-3">
              <p className="text-xs font-semibold text-amber-600 flex items-center gap-1"><Zap size={12} /> Quick Add</p>
              <input
                type="text"
                placeholder='Name (optional, e.g. "Home cooked dal")'
                value={qa.name}
                onChange={(e) => setQa((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: "calories", label: "Calories*", placeholder: "500" },
                  { key: "protein", label: "Protein g", placeholder: "20" },
                  { key: "carbs", label: "Carbs g", placeholder: "60" },
                  { key: "fat", label: "Fat g", placeholder: "15" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-muted mb-1">{label}</label>
                    <input
                      type="number"
                      placeholder={placeholder}
                      value={qa[key as keyof typeof qa]}
                      onChange={(e) => setQa((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 text-center"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                disabled={!qa.calories || qaAdding}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={15} />
                {qaAdding ? "Adding..." : `Log ${qa.calories || 0} kcal`}
              </button>
            </div>
          )}

          {/* Scan toast */}
          {scanToast && (
            <div className="mx-4 mt-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-600 flex items-center gap-2">
              <ScanLine size={12} /> {scanToast}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-[rgb(var(--border))] px-2">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSelected(null); setShowQA(false); }}
                className={`flex-1 py-2.5 px-1 text-xs font-medium border-b-2 transition-colors ${
                  tab === key ? "border-green-500 text-green-600" : "border-transparent text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Search ── */}
            {tab === "search" && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-[rgb(var(--border))]">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
                    <Search size={15} className="text-muted flex-shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search foods (roti, chicken, amul butter)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted"
                    />
                    {query && <button onClick={() => setQuery("")} className="text-muted"><X size={13} /></button>}
                  </div>
                </div>

                {/* Section header */}
                {!query && (
                  <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
                    {favorites.size > 0 && <span className="text-xs text-muted flex items-center gap-1"><Star size={10} className="fill-yellow-400 text-yellow-400" /> Favorites first</span>}
                    {recentFoods.length > 0 && <span className="text-xs text-muted flex items-center gap-1"><Clock size={10} /> Then recent</span>}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto">
                  {displayList.map((food, i) => (
                    <div
                      key={`${food.id}-${i}`}
                      className={`flex items-center gap-2 px-4 py-3 border-b border-[rgb(var(--border))] transition-colors ${selected?.id === food.id ? "bg-green-50 dark:bg-green-950/30" : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"}`}
                    >
                      <button
                        onClick={() => toggleFav(food.id)}
                        className="flex-shrink-0 p-0.5"
                        title={favorites.has(food.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          size={15}
                          className={favorites.has(food.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-zinc-600"}
                        />
                      </button>
                      <button className="flex-1 flex items-center justify-between text-left" onClick={() => selectFood(food)}>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1.5">
                            {!query && recentFoods.some((r) => r.id === food.id) && !favorites.has(food.id) && (
                              <Clock size={11} className="text-muted" />
                            )}
                            {food.name}
                          </p>
                          <p className="text-xs text-muted">{food.category} · {food.servingLabel}</p>
                        </div>
                        <div className="text-right text-xs text-muted flex-shrink-0 ml-2">
                          <p className="font-semibold text-sm text-[rgb(var(--text))]">
                            {Math.round(food.calories * food.servingSizeG / 100)} kcal
                          </p>
                          <p>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                        </div>
                      </button>
                    </div>
                  ))}
                  {query && results.length === 0 && (
                    <div className="flex flex-col items-center py-12 text-muted text-sm gap-2">
                      <span className="text-3xl">🔍</span>
                      <p>No results for &ldquo;{query}&rdquo;</p>
                      <button onClick={() => setTab("add-custom")} className="text-green-600 underline text-xs">Add as custom food</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── My Foods ── */}
            {tab === "saved" && (
              <div>
                {customFoods.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-muted text-sm gap-2">
                    <span className="text-3xl">🍽️</span>
                    <p>No saved foods yet</p>
                    <p className="text-xs">Scanned barcodes auto-save here</p>
                    <button onClick={() => setTab("add-custom")} className="text-green-600 underline text-xs mt-1">Add custom food</button>
                  </div>
                ) : customFoods.map((food) => (
                  <div key={food.id} className={`flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-zinc-800/60 ${selected?.id === food.id ? "bg-green-50 dark:bg-green-950/30" : ""}`}>
                    <button className="text-left flex-1" onClick={() => selectFood(food)}>
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-muted">per 100g · P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{food.calories} kcal</span>
                      <button onClick={() => food.customId && handleDeleteCustom(food.customId)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Templates ── */}
            {tab === "templates" && (
              <TemplateTab customFoods={customFoods} onApplyAll={handleApplyTemplate} />
            )}

            {/* ── Add Custom ── */}
            {tab === "add-custom" && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted">All values per 100g / 100ml.</p>
                {[
                  { key: "name", label: "Food Name", type: "text", placeholder: "e.g. Milld High Protein Atta" },
                  { key: "calories", label: "Calories (kcal)", type: "number", placeholder: "e.g. 340" },
                  { key: "protein", label: "Protein (g)", type: "number", placeholder: "e.g. 14" },
                  { key: "carbs", label: "Carbs (g)", type: "number", placeholder: "e.g. 60" },
                  { key: "fat", label: "Fat (g)", type: "number", placeholder: "e.g. 2.5" },
                  { key: "fiber", label: "Fiber (g)", type: "number", placeholder: "e.g. 4" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1">{label}</label>
                    <input type={type} placeholder={placeholder}
                      value={cf[key as keyof typeof cf]}
                      onChange={(e) => setCf((p) => ({ ...p, [key]: e.target.value }))}
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
          {selected && nutrition && (tab === "search" || tab === "saved") && (
            <div className="border-t border-[rgb(var(--border))] p-4 space-y-3 bg-[rgb(var(--surface))]">
              {/* Name + calories */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{selected.name}</p>
                  <p className="text-xs text-muted">{Math.round(grams)}g logged</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg leading-tight">{nutrition.calories} kcal</p>
                  <p className="text-xs text-muted">P:{nutrition.protein}g C:{nutrition.carbs}g F:{nutrition.fat}g</p>
                </div>
              </div>

              {/* Macro bar */}
              {macroTotal > 0 && (
                <>
                  <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                    <div className="bg-blue-400 rounded-full transition-all" style={{ width: `${(nutrition.protein * 4 / macroTotal) * 100}%` }} />
                    <div className="bg-yellow-400 rounded-full transition-all" style={{ width: `${(nutrition.carbs * 4 / macroTotal) * 100}%` }} />
                    <div className="bg-red-400 rounded-full transition-all" style={{ width: `${(nutrition.fat * 9 / macroTotal) * 100}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted justify-center -mt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full" />P</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full" />C</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />F</span>
                  </div>
                </>
              )}

              {/* Qty + Unit */}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Serving size</label>
                <div className="flex gap-2">
                  <input
                    type="number" min="0" step="any"
                    value={qty}
                    onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
                    className="w-20 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400 text-center font-semibold"
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
                {adding ? "Adding..." : `Add ${Math.round(grams)}g — ${nutrition.calories} kcal`}
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
