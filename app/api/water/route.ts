import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const user = await getOrCreateUser(clerkId);
  const log = await prisma.waterLog.findUnique({ where: { userId_date: { userId: user.id, date } } });
  return NextResponse.json({ glasses: log?.glasses ?? 0 });
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, glasses } = await req.json();
  const user = await getOrCreateUser(clerkId);

  const log = await prisma.waterLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { glasses: Math.max(0, Math.min(20, Number(glasses))) },
    create: { userId: user.id, date, glasses: Math.max(0, Math.min(20, Number(glasses))) },
  });
  return NextResponse.json(log);
}
