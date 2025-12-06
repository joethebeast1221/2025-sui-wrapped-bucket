// app/api/wrapped/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildBucketYearlySummary } from "@/lib/suiBucketAnalytics";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const yearStr = searchParams.get("year") ?? "2025";

  if (!address || address.length < 3) {
    return NextResponse.json(
      { error: "Invalid address" },
      { status: 400 },
    );
  }

  const year = Number(yearStr) || 2025;

  try {
    const summary = await buildBucketYearlySummary(address, year);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("Error generating Bucket summary:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
