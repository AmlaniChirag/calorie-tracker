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

    const food = {
      id: `barcode-${barcode}`,
      name: p.product_name || p.generic_name || "Unknown Product",
      category: p.categories_tags?.[0]?.replace("en:", "") ?? "Packaged Food",
      calories: Number(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
      protein: Number(n.proteins_100g ?? 0),
      carbs: Number(n.carbohydrates_100g ?? 0),
      fat: Number(n.fat_100g ?? 0),
      fiber: Number(n.fiber_100g ?? 0),
      servingSizeG: Number(p.serving_quantity ?? 100),
      servingLabel: p.serving_size ?? "1 serving",
    };

    return NextResponse.json(food);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
