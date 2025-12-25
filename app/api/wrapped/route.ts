import { NextRequest, NextResponse } from "next/server";
import { buildSuiYearlySummary } from "@/lib/suiBucketAnalytics";
import { calculateAdvancedAP } from "@/lib/mockData";
import { kv } from "@vercel/kv"; 

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const year = parseInt(searchParams.get("year") ?? "2025");
  // ✨ 新增：接收前端傳來的 handle 和 avatar
  const handle = searchParams.get("handle");
  const avatar = searchParams.get("avatar");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const summary = await buildSuiYearlySummary(address, year);
    const protocolCount = summary.interactedProtocols.length;
    const { score, rankTitle } = calculateAdvancedAP(protocolCount, address);

    // 3. 寫入 Redis
    try {
      if (protocolCount >= 0) { 
        const userData = {
          address: address,
          score: score,
          tier: rankTitle,
          protocolCount: protocolCount,
          // ✨ 新增：存入 handle 和 avatar (如果有的話)
          handle: handle || null,
          avatar: avatar || null,
          timestamp: Date.now(),
        };

        await kv.hset("bucket_user_registry", {
          [address]: JSON.stringify(userData),
        });
      }
    } catch (kvError) {
      console.warn("Failed to save to Vercel KV:", kvError);
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}