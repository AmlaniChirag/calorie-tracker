interface Props {
  goal: number;
  eaten: number;
  burned: number;
}

export default function StatCards({ goal, eaten, burned }: Props) {
  const net = eaten - burned;
  const remaining = Math.max(goal - net, 0);

  const cards = [
    { label: "Goal", value: goal, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40", unit: "kcal" },
    { label: "Eaten", value: eaten, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/40", unit: "kcal" },
    { label: "Burned", value: burned, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40", unit: "kcal" },
    { label: "Remaining", value: remaining, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40", unit: "kcal" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, color, bg, unit }) => (
        <div key={label} className={`rounded-2xl p-4 ${bg} flex flex-col gap-1`}>
          <span className="text-xs text-muted font-medium">{label}</span>
          <span className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</span>
          <span className="text-xs text-muted">{unit}</span>
        </div>
      ))}
    </div>
  );
}
