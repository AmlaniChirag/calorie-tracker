export default function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in pt-2">
      {/* Date header */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="skeleton h-7 w-14 rounded-lg" />
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="skeleton h-3.5 w-36 rounded-md" />
        </div>
        <div className="skeleton h-8 w-32 rounded-xl" />
      </div>

      {/* Calorie ring */}
      <div className="card p-6 flex justify-center">
        <div className="skeleton w-44 h-44 rounded-full" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-3 flex flex-col items-center gap-2">
            <div className="skeleton h-3.5 w-12 rounded-md" />
            <div className="skeleton h-6 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Macro bars */}
      <div className="card p-4 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="skeleton h-3.5 w-16 rounded-md" />
              <div className="skeleton h-3.5 w-20 rounded-md" />
            </div>
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Water tracker */}
      <div className="card p-4 space-y-3">
        <div className="skeleton h-4 w-28 rounded-md" />
        <div className="flex gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton flex-1 h-8 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Meal sections */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="skeleton h-5 w-5 rounded-full" />
              <div className="skeleton h-5 w-20 rounded-md" />
            </div>
            <div className="skeleton h-8 w-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
