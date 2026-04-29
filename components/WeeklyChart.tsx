"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import { formatDate, getLast7Days, getTodayString } from "@/lib/utils";

interface DayData {
  date: string;
  calories: number;
}

interface Props {
  data: DayData[];
  goal: number;
}

export default function WeeklyChart({ data, goal }: Props) {
  const today = getTodayString();
  const days = getLast7Days();

  const chartData = days.map((date) => {
    const found = data.find((d) => d.date === date);
    return {
      date,
      label: formatDate(date).split(",")[0], // short weekday
      calories: found?.calories ?? 0,
    };
  });

  return (
    <div className="surface rounded-2xl p-4 space-y-3">
      <h3 className="font-semibold text-sm">7-Day Overview</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={28} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "rgb(107 114 128)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "rgb(107 114 128)" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { date: string; calories: number };
                return (
                  <div className="surface rounded-xl px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold">{formatDate(d.date)}</p>
                    <p className="text-green-600">{d.calories} kcal</p>
                    {goal > 0 && (
                      <p className={d.calories > goal ? "text-red-500" : "text-muted"}>
                        Goal: {goal} kcal
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {goal > 0 && (
              <ReferenceLine
                y={goal}
                stroke="#22c55e"
                strokeDasharray="4 4"
                label={{ value: "Goal", position: "insideTopRight", fontSize: 10, fill: "#22c55e" }}
              />
            )}
            <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => {
                const isToday = entry.date === today;
                const isOver = goal > 0 && entry.calories > goal;
                const color = isOver ? "#ef4444" : isToday ? "#22c55e" : "#86efac";
                return <Cell key={entry.date} fill={color} opacity={entry.calories === 0 ? 0.3 : 1} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Over goal</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-200 inline-block" /> Other days</span>
      </div>
    </div>
  );
}
