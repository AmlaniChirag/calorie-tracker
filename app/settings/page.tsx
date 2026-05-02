"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { calculateTDEE, calcMacroGoals, ACTIVITY_LABELS, type ActivityLevel } from "@/lib/tdee";
import { Moon, Sun, RefreshCw, Trash2, Save, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Profile {
  name: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: string | null;
  activityLevel: string | null;
  calorieGoal: number;
  proteinGoalG: number | null;
  carbGoalG: number | null;
  fatGoalG: number | null;
  useCustomMacros: boolean;
  darkMode: boolean;
  showWater: boolean;
}

const ACTIVITY_OPTIONS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/profile");
    const p = await res.json();
    setProfile(p);
    setForm(p);
    if (p.darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!form) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const set = (key: keyof Profile, val: unknown) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleCalorieChange = (val: string) => {
    const cal = Number(val);
    if (!form.useCustomMacros) {
      const macros = calcMacroGoals(cal);
      setForm((f) => f ? { ...f, calorieGoal: cal, proteinGoalG: macros.proteinG, carbGoalG: macros.carbG, fatGoalG: macros.fatG } : f);
    } else {
      set("calorieGoal", cal);
    }
  };

  const handleMacroMode = (custom: boolean) => {
    if (!custom) {
      const macros = calcMacroGoals(form.calorieGoal);
      setForm((f) => f ? { ...f, useCustomMacros: false, proteinGoalG: macros.proteinG, carbGoalG: macros.carbG, fatGoalG: macros.fatG } : f);
    } else {
      set("useCustomMacros", true);
    }
  };

  const handleRecalcTDEE = () => {
    if (!form.age || !form.weight || !form.height || !form.gender || !form.activityLevel) return;
    const tdee = calculateTDEE(
      form.age, form.weight, form.height,
      form.gender as "male" | "female",
      form.activityLevel as ActivityLevel
    );
    const macros = calcMacroGoals(tdee);
    setForm((f) => f ? {
      ...f, calorieGoal: tdee,
      proteinGoalG: macros.proteinG, carbGoalG: macros.carbG, fatGoalG: macros.fatG,
      useCustomMacros: false,
    } : f);
  };

  const handleDarkMode = async (dark: boolean) => {
    set("darkMode", dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ darkMode: dark }),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    // Reset by re-running onboarding
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingDone: false }),
    });
    router.replace("/onboarding");
  };

  const macroKcal = (form.proteinGoalG ?? 0) * 4 + (form.carbGoalG ?? 0) * 4 + (form.fatGoalG ?? 0) * 9;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
    <div className="space-y-5 animate-fade-in pt-2">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Appearance */}
      <div className="surface rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Appearance</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm">Dark Mode</span>
          <button
            onClick={() => handleDarkMode(!form.darkMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.darkMode ? "bg-green-500" : "bg-gray-300 dark:bg-zinc-600"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleDarkMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors ${!form.darkMode ? "border-green-400 text-green-600" : "border-[rgb(var(--border))] text-muted"}`}>
            <Sun size={15} /> Light
          </button>
          <button onClick={() => handleDarkMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors ${form.darkMode ? "border-green-400 text-green-600" : "border-[rgb(var(--border))] text-muted"}`}>
            <Moon size={15} /> Dark
          </button>
        </div>

        {/* Water tracker toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Droplets size={15} className="text-blue-400" />
            <div>
              <span className="text-sm">Water Tracker</span>
              <p className="text-xs text-muted">Show on dashboard</p>
            </div>
          </div>
          <button
            onClick={() => set("showWater", !form.showWater)}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.showWater ? "bg-blue-400" : "bg-gray-300 dark:bg-zinc-600"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.showWater ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className="surface rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-sm">Calorie & Macro Goals</h2>

        <div>
          <label className="block text-xs font-medium mb-1">Daily Calorie Goal (kcal)</label>
          <input type="number" value={form.calorieGoal} onChange={(e) => handleCalorieChange(e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2">Macro Goals</label>
          <div className="flex gap-2 mb-3">
            <button onClick={() => handleMacroMode(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${!form.useCustomMacros ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))] text-muted"}`}>
              Auto (30/45/25%)
            </button>
            <button onClick={() => handleMacroMode(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${form.useCustomMacros ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))] text-muted"}`}>
              Custom
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "proteinGoalG", label: "Protein (g)", color: "text-blue-500" },
              { key: "carbGoalG", label: "Carbs (g)", color: "text-yellow-500" },
              { key: "fatGoalG", label: "Fat (g)", color: "text-red-500" },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <label className={`block text-xs font-medium mb-1 ${color}`}>{label}</label>
                <input type="number"
                  value={(form[key as keyof Profile] as number) ?? 0}
                  disabled={!form.useCustomMacros}
                  onChange={(e) => set(key as keyof Profile, Number(e.target.value))}
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
                />
              </div>
            ))}
          </div>
          {form.useCustomMacros && (
            <p className={`text-xs mt-2 ${Math.abs(macroKcal - form.calorieGoal) > 50 ? "text-amber-500" : "text-green-500"}`}>
              Macro total: {Math.round(macroKcal)} kcal
            </p>
          )}
        </div>
      </div>

      {/* Profile & TDEE */}
      <div className="surface rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "age", label: "Age", placeholder: "25" },
            { key: "weight", label: "Weight (kg)", placeholder: "70" },
            { key: "height", label: "Height (cm)", placeholder: "175" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1">{label}</label>
              <input type="number" placeholder={placeholder}
                value={(form[key as keyof Profile] as number) ?? ""}
                onChange={(e) => set(key as keyof Profile, Number(e.target.value))}
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1">Gender</label>
            <select value={form.gender ?? "male"} onChange={(e) => set("gender", e.target.value)}
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Activity Level</label>
          <select value={form.activityLevel ?? "moderate"} onChange={(e) => set("activityLevel", e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400">
            {ACTIVITY_OPTIONS.map((a) => (
              <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>
            ))}
          </select>
        </div>

        <button onClick={handleRecalcTDEE}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-400 text-green-600 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors">
          <RefreshCw size={15} /> Recalculate TDEE from Profile
        </button>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50 transition-colors">
        <Save size={16} />
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>

      {/* Reset */}
      <div className="surface rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-sm text-red-500">Danger Zone</h2>
        {!showReset ? (
          <button onClick={() => setShowReset(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <Trash2 size={15} /> Reset All Data & Re-onboard
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-500 font-medium">This will clear your profile and restart onboarding. Meal logs stay in DB.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowReset(false)}
                className="flex-1 py-2 rounded-xl border border-[rgb(var(--border))] text-sm text-muted">Cancel</button>
              <button onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Confirm Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
      </main>
    </div>
  );
}
