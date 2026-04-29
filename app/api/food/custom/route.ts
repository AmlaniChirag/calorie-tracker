import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(clerkId);
  const foods = await prisma.customFood.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = await getOrCreateUser(clerkId);

  const food = await prisma.customFood.create({
    data: {
      userId: user.id,
      name: String(body.name),
      calories: Number(body.calories),
      protein: Number(body.protein),
      carbs: Number(body.carbs),
      fat: Number(body.fat),
      fiber: Number(body.fiber ?? 0),
    },
  });
  return NextResponse.json(food, { status: 201 });
}
