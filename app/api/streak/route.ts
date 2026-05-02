import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ streak: 0 });

  try {
    const user = await getOrCreateUser(clerkId);

    // Distinct dates that have at least one meal, newest first
    const rows = await prisma.meal.findMany({
      where: { userId: user.id },
      select: { date: true },
      distinct: ["date"],
      orderBy: { date: "desc" },
    });

    if (rows.length === 0) return NextResponse.json({ streak: 0 });

    const dateStrs = rows.map((r) => r.date); // "YYYY-MM-DD" strings

    // Streak anchor: today or yesterday (grace period if nothing logged today yet)
    const todayStr = new Date().toISOString().split("T")[0];
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yesterdayStr = yest.toISOString().split("T")[0];

    const anchor = dateStrs[0];
    if (anchor !== todayStr && anchor !== yesterdayStr) {
      // Last log older than yesterday → streak broken
      return NextResponse.json({ streak: 0 });
    }

    // Walk backwards counting consecutive days
    let streak = 1;
    let cursor = new Date(anchor + "T00:00:00Z");

    for (let i = 1; i < dateStrs.length; i++) {
      const prev = new Date(cursor);
      prev.setUTCDate(prev.getUTCDate() - 1);
      const prevStr = prev.toISOString().split("T")[0];

      if (dateStrs[i] === prevStr) {
        streak++;
        cursor = prev;
      } else {
        break;
      }
    }

    return NextResponse.json({ streak });
  } catch (err) {
    console.error("[/api/streak] Failed to compute streak:", err);
    return NextResponse.json({ streak: 0 });
  }
}
