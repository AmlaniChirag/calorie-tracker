"use client";
import { useMemo, useState } from "react";
import { ChevronDown, FlaskConical } from "lucide-react";
import { BUILT_IN_FOODS } from "@/lib/foods";
import {
  MICRO_KEYS,
  MICRO_META,
  buildNameMicrosMap,
  aggregateMicros,
  fmtMicro,
} from "@/lib/micros";
import { cn } from "@/lib/utils";

interface Meal {
  foodName: string;
  servingSize: number;
}

interface Props {
  meals: Meal[];
}

// Built once per module load — stable reference
const NAME_MICROS_MAP = buildNameMicrosMap(BUILT_IN_FOODS);

export default function MicronutrientsCard({ meals }: Props) {
  const [open, setOpen] = useState(false);

  const totals = useMemo(() => aggregateMicros(meals, NAME_MICROS_MAP), [meals]);

  const trackedCount = meals.filter((m) => NAME_MICROS_MAP[m.foodName]).length;
  const anyData = MICRO_KEYS.some((k) => totals[k] !== undefined);

  return (
    <div className="surface rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <FlaskConical size={18} className="text-purple-500 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold text-sm">Micronutrients</p>
            <p className="text-xs text-muted">
              {trackedCount} of {meals.length} logged food{meals.length !== 1 ? "s" : ""} have micro data
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={cn("text-muted transition-transform duration-200", open ? "rotate-180" : "")}
        />
      </button>

      {open && (
        <div className="border-t border-[rgb(var(--border))] p-4 space-y-3">
          {!anyData ? (
            <p className="text-sm text-muted text-center py-4">
              No micro data for today&apos;s foods yet. Try adding spinach, eggs, salmon, dal, or nuts.
            </p>
          ) : (
            <>
              {MICRO_KEYS.map((key) => {
                const meta = MICRO_META[key];
                const val = totals[key] ?? 0;
                const pct = Math.min((val / meta.rda) * 100, 100);
                const hasData = totals[key] !== undefined;

                let barColor = meta.color;
                let textColor = "text-green-600 dark:text-green-400";
                if (pct < 33)  textColor = "text-red-500 dark:text-red-400";
                else if (pct < 66) textColor = "text-amber-500 dark:text-amber-400";

                return (
                  <div key={key} className={cn("space-y-1", !hasData && "opacity-40")}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{meta.label}</span>
                      <span className={cn("tabular font-semibold", hasData ? textColor : "text-muted")}>
                        {hasData
                          ? `${fmtMicro(val, meta.unit)} / ${meta.rda} ${meta.unit}`
                          : `— / ${meta.rda} ${meta.unit}`}
                        {hasData && (
                          <span className="font-normal text-muted ml-1">
                            ({Math.round(pct)}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[rgb(var(--border))]">
                      {hasData && (
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              <p className="text-[10px] text-muted pt-1 border-t border-[rgb(var(--border))]">
                RDAs are general adult averages. Custom foods &amp; barcodes don&apos;t contribute until micro data is available.
                {trackedCount < meals.length && (
                  <> {meals.length - trackedCount} food{meals.length - trackedCount !== 1 ? "s" : ""} untracked.</>
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
