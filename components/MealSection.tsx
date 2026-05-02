"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MealEntry {
  id: string;
  mealType: string;
  foodName: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  type: string;
  label: string;
  emoji: string;
  meals: MealEntry[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
  onCopyYesterday?: () => Promise<void>;
}

export default function MealSection({ type, label, emoji, meals, onAddClick, onDelete, onCopyYesterday }: Props) {
  const [open, setOpen] = useState(true);
  const [copying, setCopying] = useState(false);
  const total = meals.reduce((s, m) => s + m.calories, 0);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // don't toggle open/close
    if (!onCopyYesterday || copying) return;
    setCopying(true);
    try { await onCopyYesterday(); }
    finally { setCopying(false); }
  };

  return (
    <div className="surface rounded-2xl overflow-hidden">
      <div className="flex items-center">
        <button
          className="flex-1 flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{emoji}</span>
            <div className="text-left">
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted">{meals.length} item{meals.length !== 1 ? "s" : ""} · {total} kcal</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={cn("text-muted transition-transform duration-200 mr-1", open ? "rotate-180" : "")}
          />
        </button>

        {/* Per-meal copy yesterday */}
        {onCopyYesterday && (
          <button
            onClick={handleCopy}
            disabled={copying}
            title={`Copy yesterday's ${label.toLowerCase()}`}
            className="flex items-center gap-1 px-3 py-1.5 mr-2 rounded-lg text-xs font-medium text-muted hover:text-[rgb(var(--text))] hover:bg-gray-100 dark:hover:bg-white/[0.06] border border-[rgb(var(--border))] transition-all disabled:opacity-40 flex-shrink-0"
          >
            {copying
              ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Copy size={11} />}
            <span className="hidden sm:inline">{copying ? "Copying…" : "Copy"}</span>
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-[rgb(var(--border))]">
          {meals.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted italic">
              Nothing logged yet — tap + to add food
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border))]">
              {meals.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.foodName}</p>
                    <p className="text-xs text-muted">
                      {m.servingSize}× · P:{m.protein}g C:{m.carbs}g F:{m.fat}g
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-sm font-semibold">{m.calories} kcal</span>
                    <button
                      onClick={() => onDelete(m.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="p-3 border-t border-[rgb(var(--border))]">
            <button
              onClick={onAddClick}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Add Food
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
