export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
      <div className="text-center space-y-3">
        <p className="text-6xl">🥗</p>
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted">Page not found.</p>
        <a href="/dashboard" className="inline-block mt-2 text-green-600 underline text-sm">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
