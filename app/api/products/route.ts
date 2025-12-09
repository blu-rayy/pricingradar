import { NextResponse } from "next/server";
import { getAllProductsWithPrices } from "@/lib/db/supabase";
import { extractQuantity, calculatePricePerUnit } from "@/lib/scrapers/index";

export const dynamic = "force-dynamic";

interface CachedProduct {
  id: string;
  name: string;
  brand: string | null;
  dosage: string | null;
  url: string;
  marketplace: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
  quantity: number;
  pricePerUnit: number;
  scrapedAt: string | null;
}

export async function GET(): Promise<NextResponse> {
  try {
    const data = await getAllProductsWithPrices();

    // Transform DB format to a format suitable for the frontend
    const products: CachedProduct[] = data.map((item) => {
      const name = item.product.name || "";
      const price = item.latestPrice?.price ?? 0;
      const quantity = extractQuantity(name);
      const pricePerUnit = calculatePricePerUnit(price, quantity);

      return {
        id: item.product.id,
        name,
        brand: item.product.brand,
        dosage: item.product.dosage,
        url: item.product.url,
        marketplace: item.competitor?.marketplace || "unknown",
        price,
        originalPrice: item.latestPrice?.original_price ?? null,
        discountPercent: item.latestPrice?.discount_percent ?? null,
        inStock: item.latestPrice?.in_stock ?? true,
        quantity,
        pricePerUnit,
        scrapedAt: item.latestPrice?.scraped_at ?? null,
      };
    });

    // Get the most recent scrape timestamp
    const lastScrapedAt = products.reduce((latest, p) => {
      if (!p.scrapedAt) return latest;
      if (!latest) return p.scrapedAt;
      return new Date(p.scrapedAt) > new Date(latest) ? p.scrapedAt : latest;
    }, null as string | null);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      lastScrapedAt,
    });
  } catch (error) {
    console.error("[API/products] Error fetching cached products:", error);
    return NextResponse.json(
      {
        success: false,
        products: [],
        count: 0,
        lastScrapedAt: null,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
