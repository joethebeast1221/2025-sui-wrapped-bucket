import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// 為了防止超時，設為 nodejs runtime
export const runtime = "nodejs"; 
// 這是管理員功能，不需要快取
export const revalidate = 0; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const format = searchParams.get("format") || "json"; // 預設 json，可選 csv

  // 1. 安全檢查：驗證密碼
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. 從 Redis 抓取所有註冊資料 (HGETALL)
    const registry = await kv.hgetall("bucket_user_registry");

    if (!registry) {
      return NextResponse.json({ message: "No data found" }, { status: 200 });
    }

    // 3. 整理資料格式
    // Redis 回傳的是 { "0x123": "JSON字串", "0x456": "JSON字串" }
    // 我們要把它轉成陣列 [ { address: "0x123", ... }, ... ]
    const users = Object.values(registry).map((item: any) => {
        // 因為我們存進去是用 JSON.stringify，拿出來要 parse
        return typeof item === 'string' ? JSON.parse(item) : item;
    });

    // 4. 如果要求 CSV 格式 (適合 Excel/Google Sheets)
    if (format === "csv") {
        const headers = ["Address", "Twitter Handle", "TX Count", "Active Days", "Tier", "Timestamp"];
        const csvRows = users.map((u: any) => {
            return [
                u.address,
                u.handle || "N/A",
                u.tx,
                u.days,
                u.tier,
                new Date(u.timestamp).toISOString()
            ].join(",");
        });
        
        const csvString = [headers.join(","), ...csvRows].join("\n");
        
        return new NextResponse(csvString, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="bucket-users-${Date.now()}.csv"`,
            }
        });
    }

    // 5. 預設回傳 JSON
    return NextResponse.json({ count: users.length, users }, { status: 200 });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}