"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, Check, Search, ChevronDown, ChevronUp } from "lucide-react";
import { BUILT_IN_FOODS, searchFoods, type FoodItem } from "@/lib/foods";

export interface TemplateItem {
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MealTemplate {
  id: string;
  name: string;
  items: TemplateItem[];
  totalCalories: number;
}

interface Props {
  customFoods: FoodItem[];
  onApplyAll: (items: TemplateItem[]) => Promise<void>;
}

const STORAGE_KEY = "mealTemplates_v1";

function loadTemplates(): MealTemplate[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function save(templates: MealTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function calcNutrition(food: FoodItem, grams: number) {
  const f = grams / 100;
  return {
    calories: Math.round(food.calories * f),
    protein: Math.round(food.protein * f * 10) / 10,
    carbs: Math.round(food.carbs * f * 10) / 10,
    fat: Math.round(food.fat * f * 10) / 10,
    fiber: Math.round(food.fiber * f * 10) / 10,
  };
}

export default function TemplateTab({ customFoods, onApplyAll }: Props) {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [creating, setCreating] = useState(false);
  const [tName, setTName] = useState("");
  const [tItems, setTItems] = useState<TemplateItem[]>([]);
  const [tQuery, setTQuery] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { setTemplates(loadTemplates()); }, []);

  const tResults = searchFoods(tQuery, customFoods).slice(0, 8);

  const addToTemplate = (food: FoodItem) => {
    const n = calcNutrition(food, food.servingSizeG || 100);
    setTItems((prev) => [...prev, { foodName: food.name, grams: food.servingSizeG || 100, ...n }]);
    setTQuery("");
  };

  const saveTemplate = () => {
    if (!tName.trim() || tItems.length === 0) return;
    const updated = [
      {
        id: Date.now().toString(),
        name: tName.trim(),
        items: tItems,
        totalCalories: tItems.reduce((s, i) => s + i.calories, 0),
      },
      ...templates,
    ];
    setTemplates(updated);
    save(updated);
    setCreating(false);
    setTName("");
    setTItems([]);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    save(updated);
  };

  const applyTemplate = async (t: MealTemplate) => {
    setApplying(t.id);
    try { await onApplyAll(t.items); }
    finally { setApplying(null); }
  };

  /* ── Create view ── */
  if (creating) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setCreating(false); setTName(""); setTItems([]); }} className="text-muted hover:text-[rgb(var(--text))]">
            <X size={18} />
          </button>
          <h3 className="font-semibold">New Template</h3>
        </div>

        <input
          type="text"
          placeholder='Template name (e.g. "My Breakfast")'
          value={tName}
          onChange={(e) => setTName(e.target.value)}
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Added items */}
        {tItems.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted">Foods in template</p>
            {tItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{item.foodName}</p>
                  <p className="text-xs text-muted">{item.grams}g · {item.calories} kcal · P:{item.protein}g</p>
                </div>
                <button onClick={() => setTItems((prev) => prev.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                  <X size={14} />
                </button>
              </div>
            ))}
            <p className="text-xs text-right text-green-600 font-medium">
              Total: {tItems.reduce((s, i) => s + i.calories, 0)} kcal · {(tItems.reduce((s, i) => s + i.protein, 0) * 10 / 10).toFixed(1)}g protein
            </p>
          </div>
        )}

        {/* Food search to add */}
        <div>
          <p className="text-xs font-medium text-muted mb-2">Add foods</p>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2 mb-2">
            <Search size={14} className="text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search food to add..."
              value={tQuery}
              onChange={(e) => setTQuery(e.target.value)}
              className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted"
            />
            {tQuery && <button onClick={() => setTQuery("")} className="text-muted"><X size={13} /></button>}
          </div>
          <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden max-h-44 overflow-y-auto">
            {(tQuery ? tResults : BUILT_IN_FOODS.slice(0, 8)).map((food) => (
              <button
                key={food.id}
                onClick={() => addToTemplate(food)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 border-b border-[rgb(var(--border))] last:border-0 text-left"
              >
                <div>
                  <p className="text-sm">{food.name}</p>
                  <p className="text-xs text-muted">{food.servingLabel} · {Math.round(food.calories * food.servingSizeG / 100)} kcal</p>
                </div>
                <Plus size={15} className="text-green-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveTemplate}
          disabled={!tName.trim() || tItems.length === 0}
          className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          <Check size={15} /> Save Template ({tItems.length} food{tItems.length !== 1 ? "s" : ""})
        </button>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="p-4 space-y-3">
      <button
        onClick={() => setCreating(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-green-400 text-green-600 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
      >
        <Plus size={16} /> New Meal Template
      </button>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-muted text-sm gap-2">
          <span className="text-4xl">📋</span>
          <p className="font-medium">No templates yet</p>
          <p className="text-xs text-center px-6">Save common meals (breakfast, lunch) and add them all in one tap</p>
        </div>
      ) : (
        templates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-[rgb(var(--border))] overflow-hidden">
            <div className="flex items-center justify-between p-3">
              <button className="text-left flex-1" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted">{t.items.length} foods · {t.totalCalories} kcal</p>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="p-1.5 text-muted">
                  {expandedId === t.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {expandedId === t.id && (
              <div className="px-3 pb-2 space-y-1 border-t border-[rgb(var(--border))]">
                {t.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm border-b border-[rgb(var(--border))] last:border-0">
                    <span>{item.foodName}</span>
                    <span className="text-xs text-muted">{item.grams}g · {item.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}

            <div className="px-3 pb-3">
              <button
                onClick={() => applyTemplate(t)}
                disabled={applying === t.id}
                className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
              >
                {applying === t.id ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
                ) : (
                  <><Plus size={14} /> Add All to Meal</>
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
