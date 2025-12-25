import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // 預設第 1 頁，每頁 9 筆 (配合 3 列的排版)
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "9");

  try {
    // 1. 從 Redis 抓取所有資料
    // (注意：當數據量非常大時，建議改用 Redis ZSET，但目前 Hash 結構在幾千人內都還算快)
    const registry = await kv.hgetall("bucket_user_registry");

    if (!registry) {
      return NextResponse.json({ 
        total: 0, 
        users: [],
        hasMore: false 
      });
    }

    // 2. 轉換資料
    const allUsers = Object.values(registry).map((item: any) => 
      typeof item === 'string' ? JSON.parse(item) : item
    );

    // 3. 排序 (分數高 -> 低)
    allUsers.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    // 4. 分頁切割 (Slice)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    // 5. 判斷是否還有下一頁
    const hasMore = endIndex < allUsers.length;

    return NextResponse.json({ 
      total: allUsers.length, 
      users: paginatedUsers,
      hasMore 
    });

  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ total: 0, users: [], hasMore: false }, { status: 500 });
  }
}