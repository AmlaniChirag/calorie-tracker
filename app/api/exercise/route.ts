import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const user = await getOrCreateUser(clerkId);
  const exercises = await prisma.exercise.findMany({
    where: { userId: user.id, date },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = await getOrCreateUser(clerkId);

  const exercise = await prisma.exercise.create({
    data: {
      userId: user.id,
      date: body.date,
      name: body.name,
      caloriesBurned: Number(body.caloriesBurned),
    },
  });
  return NextResponse.json(exercise, { status: 201 });
}
