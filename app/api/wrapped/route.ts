// app/api/wrapped/route.ts
import { NextResponse } from "next/server";
import { buildBucketYearlySummary } from "@/lib/suiBucketAnalytics";
import type { BucketYearlySummary } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const yearParam = searchParams.get("year");

  if (!address) {
    return NextResponse.json(
      { error: "Missing address" },
      { status: 400 }
    );
  }

  const year = Number(yearParam ?? "2025") || 2025;

  try {
    const summary: BucketYearlySummary = await buildBucketYearlySummary(
      address,
      year
    );

    return NextResponse.json(summary, { status: 200 });
  } catch (err: any) {
    console.error("Wrapped API error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to load Sui data. The RPC may be rate-limited or temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}

