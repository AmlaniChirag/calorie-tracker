"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateTDEE, calcMacroGoals, ACTIVITY_LABELS, type ActivityLevel } from "@/lib/tdee";

type Step = "profile" | "goals";

const ACTIVITY_OPTIONS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    gender: "male" as "male" | "female",
    activityLevel: "moderate" as ActivityLevel,
  });

  const [goals, setGoals] = useState({
    calorieGoal: 0,
    proteinGoalG: 0,
    carbGoalG: 0,
    fatGoalG: 0,
    useCustomMacros: false,
  });

  const [tdee, setTdee] = useState(0);

  // Check if already onboarded
  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((p) => {
      if (p.onboardingDone) router.replace("/dashboard");
    });
  }, [router]);

  const calcGoals = () => {
    if (!form.age || !form.weight || !form.height) return;
    const calculated = calculateTDEE(
      Number(form.age),
      Number(form.weight),
      Number(form.height),
      form.gender,
      form.activityLevel
    );
    setTdee(calculated);
    const macros = calcMacroGoals(calculated);
    setGoals({
      calorieGoal: calculated,
      proteinGoalG: macros.proteinG,
      carbGoalG: macros.carbG,
      fatGoalG: macros.fatG,
      useCustomMacros: false,
    });
    setStep("goals");
  };

  const handleMacroMode = (custom: boolean) => {
    if (!custom) {
      const macros = calcMacroGoals(goals.calorieGoal);
      setGoals((g) => ({ ...g, useCustomMacros: false, proteinGoalG: macros.proteinG, carbGoalG: macros.carbG, fatGoalG: macros.fatG }));
    } else {
      setGoals((g) => ({ ...g, useCustomMacros: true }));
    }
  };

  const handleCalorieChange = (val: string) => {
    const cal = Number(val);
    setGoals((g) => {
      if (!g.useCustomMacros) {
        const macros = calcMacroGoals(cal);
        return { ...g, calorieGoal: cal, proteinGoalG: macros.proteinG, carbGoalG: macros.carbG, fatGoalG: macros.fatG };
      }
      return { ...g, calorieGoal: cal };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: Number(form.age),
          weight: Number(form.weight),
          height: Number(form.height),
          gender: form.gender,
          activityLevel: form.activityLevel,
          calorieGoal: goals.calorieGoal,
          proteinGoalG: goals.proteinGoalG,
          carbGoalG: goals.carbGoalG,
          fatGoalG: goals.fatGoalG,
          useCustomMacros: goals.useCustomMacros,
          onboardingDone: true,
        }),
      });
      router.replace("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const profileValid = form.age && form.weight && form.height;
  const macroKcal = goals.proteinGoalG * 4 + goals.carbGoalG * 4 + goals.fatGoalG * 9;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {(["profile", "goals"] as Step[]).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step === s || (step === "goals" && s === "profile") ? "bg-green-500" : "bg-gray-200 dark:bg-zinc-700"}`} />
          ))}
        </div>

        <div className="surface rounded-3xl p-6 shadow-xl space-y-5 animate-fade-in">
          {step === "profile" && (
            <>
              <div>
                <h1 className="text-2xl font-bold">Welcome! Let&apos;s set up your profile</h1>
                <p className="text-muted text-sm mt-1">We&apos;ll calculate your daily calorie goal automatically.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Your Name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Age</label>
                    <input type="number" placeholder="25" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Weight (kg)</label>
                    <input type="number" placeholder="70" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Height (cm)</label>
                  <input type="number" placeholder="175" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Gender</label>
                  <div className="flex gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button key={g} onClick={() => setForm((f) => ({ ...f, gender: g }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${form.gender === g ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))] text-muted"}`}>
                        {g === "male" ? "♂ Male" : "♀ Female"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Activity Level</label>
                  <div className="space-y-2">
                    {ACTIVITY_OPTIONS.map((level) => (
                      <button key={level} onClick={() => setForm((f) => ({ ...f, activityLevel: level }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${form.activityLevel === level ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "border-[rgb(var(--border))] text-muted"}`}>
                        {ACTIVITY_LABELS[level]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={calcGoals} disabled={!profileValid}
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50 transition-colors">
                Calculate My Goals →
              </button>
            </>
          )}

          {step === "goals" && (
            <>
              <div>
                <h1 className="text-2xl font-bold">Your Daily Goals</h1>
                {tdee > 0 && (
                  <p className="text-muted text-sm mt-1">
                    TDEE calculated: <span className="text-green-600 font-semibold">{tdee} kcal/day</span>. Adjust below.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Daily Calorie Goal (kcal)</label>
                  <input type="number" value={goals.calorieGoal} onChange={(e) => handleCalorieChange(e.target.value)}
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400" />
                </div>

                {/* Macro mode toggle */}
                <div>
                  <label className="block text-xs font-medium mb-2">Macro Goals</label>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => handleMacroMode(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${!goals.useCustomMacros ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))] text-muted"}`}>
                      Auto (30/45/25%)
                    </button>
                    <button onClick={() => handleMacroMode(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${goals.useCustomMacros ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))] text-muted"}`}>
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
                        <input
                          type="number"
                          value={goals[key as keyof typeof goals] as number}
                          disabled={!goals.useCustomMacros}
                          onChange={(e) => setGoals((g) => ({ ...g, [key]: Number(e.target.value) }))}
                          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
                        />
                      </div>
                    ))}
                  </div>

                  {goals.useCustomMacros && (
                    <p className={`text-xs mt-2 ${Math.abs(macroKcal - goals.calorieGoal) > 50 ? "text-amber-500" : "text-green-500"}`}>
                      Macro total: {Math.round(macroKcal)} kcal
                      {Math.abs(macroKcal - goals.calorieGoal) > 50 && ` (${Math.round(Math.abs(macroKcal - goals.calorieGoal))} kcal off from goal)`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("profile")}
                  className="flex-1 py-3 rounded-xl border border-[rgb(var(--border))] text-sm font-medium text-muted">
                  ← Back
                </button>
                <button onClick={handleSave} disabled={saving || !goals.calorieGoal}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50 transition-colors">
                  {saving ? "Saving..." : "Start Tracking 🎉"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
