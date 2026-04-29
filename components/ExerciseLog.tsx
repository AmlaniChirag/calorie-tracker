"use client";
import { useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";

export interface ExerciseEntry {
  id: string;
  name: string;
  caloriesBurned: number;
}

interface Props {
  exercises: ExerciseEntry[];
  date: string;
  onAdd: (entry: { date: string; name: string; caloriesBurned: number }) => Promise<void>;
  onDelete: (id: string) => void;
}

export default function ExerciseLog({ exercises, date, onAdd, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [saving, setSaving] = useState(false);

  const total = exercises.reduce((s, e) => s + e.caloriesBurned, 0);

  const handleAdd = async () => {
    if (!name || !calories) return;
    setSaving(true);
    try {
      await onAdd({ date, name, caloriesBurned: Number(calories) });
      setName("");
      setCalories("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> Exercise
          {total > 0 && <span className="text-orange-500 font-bold">−{total} kcal</span>}
        </h3>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-green-600 font-medium hover:underline"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {exercises.length === 0 && !open && (
        <p className="text-sm text-muted">No exercise logged today. Every move counts!</p>
      )}

      {exercises.length > 0 && (
        <div className="space-y-2">
          {exercises.map((e) => (
            <div key={e.id} className="flex items-center justify-between">
              <span className="text-sm">{e.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-orange-500">−{e.caloriesBurned} kcal</span>
                <button
                  onClick={() => onDelete(e.id)}
                  className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="space-y-2 pt-1">
          <input
            autoFocus
            type="text"
            placeholder="Exercise name (e.g. Running, Yoga)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Calories burned"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleAdd}
              disabled={!name || !calories || saving}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {saving ? "..." : "Log"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl border border-[rgb(var(--border))] text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
