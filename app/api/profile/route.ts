import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clerkUser = await currentUser();
    const user = await getOrCreateUser(clerkId, clerkUser?.fullName ?? undefined);
    return NextResponse.json(user);
  } catch (err) {
    console.error("[/api/profile GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
  const body = await req.json();
  const clerkUser = await currentUser();
  const dbUser = await getOrCreateUser(clerkId, clerkUser?.fullName ?? undefined);

  const updated = await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name: body.name ?? dbUser.name,
      age: body.age !== undefined ? Number(body.age) : dbUser.age,
      weight: body.weight !== undefined ? Number(body.weight) : dbUser.weight,
      height: body.height !== undefined ? Number(body.height) : dbUser.height,
      gender: body.gender ?? dbUser.gender,
      activityLevel: body.activityLevel ?? dbUser.activityLevel,
      calorieGoal: body.calorieGoal !== undefined ? Number(body.calorieGoal) : dbUser.calorieGoal,
      proteinGoalG: body.proteinGoalG !== undefined ? (body.proteinGoalG === null ? null : Number(body.proteinGoalG)) : dbUser.proteinGoalG,
      carbGoalG: body.carbGoalG !== undefined ? (body.carbGoalG === null ? null : Number(body.carbGoalG)) : dbUser.carbGoalG,
      fatGoalG: body.fatGoalG !== undefined ? (body.fatGoalG === null ? null : Number(body.fatGoalG)) : dbUser.fatGoalG,
      useCustomMacros: body.useCustomMacros !== undefined ? Boolean(body.useCustomMacros) : dbUser.useCustomMacros,
      darkMode: body.darkMode !== undefined ? Boolean(body.darkMode) : dbUser.darkMode,
      onboardingDone: body.onboardingDone !== undefined ? Boolean(body.onboardingDone) : dbUser.onboardingDone,
      showWater: body.showWater !== undefined ? Boolean(body.showWater) : dbUser.showWater,
      showMicros: body.showMicros !== undefined ? Boolean(body.showMicros) : dbUser.showMicros,
    },
  });

  return NextResponse.json(updated);
  } catch (err) {
    console.error("[/api/profile POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
