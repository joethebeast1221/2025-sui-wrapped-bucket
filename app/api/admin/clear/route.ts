import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";
// 避免快取
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // 1. 安全檢查：驗證密碼 (使用與 export 功能相同的環境變數)
  // 如果沒有設定環境變數，這行保護會失效，建議務必設定 ADMIN_SECRET
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. 刪除 Redis 中的關鍵 Keys
    // bucket_community_feed: 排行榜清單
    // bucket_user_registry: 所有用戶的詳細註冊資料
    const keysToDelete = ["bucket_community_feed", "bucket_user_registry"];
    
    // 執行刪除
    const deletedCount = await kv.del(...keysToDelete);

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${deletedCount} keys from database. Leaderboard is now empty.` 
    }, { status: 200 });

  } catch (error) {
    console.error("Clear DB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}