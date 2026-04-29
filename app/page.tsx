import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-zinc-950 dark:to-zinc-900 p-6">
      <div className="max-w-lg text-center space-y-6">
        <div className="text-6xl">🥗</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">NutriTrack</h1>
        <p className="text-lg text-gray-600 dark:text-zinc-300">
          Calorie & macro tracking built for Indian & global foods. Set custom protein, carb, and fat targets. Sync across devices.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-3 border border-green-300 text-green-700 hover:bg-green-50 rounded-xl font-semibold transition-colors dark:border-green-700 dark:text-green-400"
          >
            Sign In
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 text-sm text-gray-500 dark:text-zinc-400">
          <div className="flex flex-col items-center gap-1"><span className="text-2xl">🍛</span><span>80+ Indian & global foods</span></div>
          <div className="flex flex-col items-center gap-1"><span className="text-2xl">📊</span><span>Custom macro goals</span></div>
          <div className="flex flex-col items-center gap-1"><span className="text-2xl">📱</span><span>Barcode scanner</span></div>
        </div>
      </div>
    </div>
  );
}
