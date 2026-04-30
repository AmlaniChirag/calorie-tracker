import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const barcode = req.nextUrl.searchParams.get("barcode");
  if (!barcode) return NextResponse.json({ error: "barcode required" }, { status: 400 });

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = data.product;
    const n = p.nutriments ?? {};

    const safeNum = (v: unknown, fallback = 0) => {
      const n = Number(v);
      return isFinite(n) && n >= 0 ? n : fallback;
    };

    const food = {
      id: `barcode-${barcode}`,
      name: String(p.product_name || p.product_name_en || p.generic_name || "Unknown Product").trim() || "Unknown Product",
      category: String(p.categories_tags?.[0] ?? "").replace(/^[a-z]{2}:/, "") || "Packaged Food",
      calories: safeNum(n["energy-kcal_100g"] ?? n["energy-kcal"]),
      protein: safeNum(n.proteins_100g),
      carbs: safeNum(n.carbohydrates_100g),
      fat: safeNum(n.fat_100g),
      fiber: safeNum(n.fiber_100g),
      servingSizeG: safeNum(p.serving_quantity, 100) || 100,
      servingLabel: String(p.serving_size || "1 serving").slice(0, 50),
    };

    return NextResponse.json(food);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
