export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-4 md:ml-52 md:pl-8">
        {children}
      </main>
    </div>
  );
}
