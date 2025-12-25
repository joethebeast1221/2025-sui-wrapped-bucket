import { NextRequest, NextResponse } from "next/server";
import { buildSuiYearlySummary } from "@/lib/suiBucketAnalytics";
import { calculateAdvancedAP } from "@/lib/mockData";
import { kv } from "@vercel/kv"; // ✅ 保留 Redis

// 確保這是動態路由，避免被靜態快取
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const year = parseInt(searchParams.get("year") ?? "2025");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    // 1. 抓取鏈上數據 (這裡回傳的 summary 已無 tx/days 欄位)
    const summary = await buildSuiYearlySummary(address, year);

    // 2. 計算分數與排名 (使用新的協議數量邏輯)
    const protocolCount = summary.interactedProtocols.length;
    
    // 呼叫我們在 lib/mockData.ts 定義的新公式
    const { score, rankTitle } = calculateAdvancedAP(protocolCount, address);

    // 3. ✅ 寫入 Vercel KV (Redis)
    // 這裡是用戶生成卡片時的「存檔」動作，為了讓之後可以導出 CSV
    try {
      // 只有當有數據時才存 (或者您可以決定即使是 0 也存)
      if (protocolCount >= 0) { 
        const userData = {
          address: address,
          score: score,
          tier: rankTitle,
          protocolCount: protocolCount, // 改存這個指標
          timestamp: Date.now(),
        };

        // 使用 Hash 結構儲存，Key 為 address，避免重複
        await kv.hset("bucket_user_registry", {
          [address]: JSON.stringify(userData),
        });
      }
    } catch (kvError) {
      console.warn("Failed to save to Vercel KV:", kvError);
      // 存檔失敗不應阻擋 API 回傳，僅記錄錯誤
    }

    // 4. 回傳結果給前端
    return NextResponse.json(summary);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}