import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const user = await getOrCreateUser(clerkId);
  const meals = await prisma.meal.findMany({
    where: { userId: user.id, date },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(meals);
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = await getOrCreateUser(clerkId);

  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      date: body.date,
      mealType: body.mealType,
      foodName: body.foodName,
      servingSize: Number(body.servingSize),
      calories: Number(body.calories),
      protein: Number(body.protein),
      carbs: Number(body.carbs),
      fat: Number(body.fat),
      fiber: Number(body.fiber ?? 0),
    },
  });
  return NextResponse.json(meal, { status: 201 });
}
