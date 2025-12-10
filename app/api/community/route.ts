import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// 使用 Edge Runtime 讓讀取速度超快
export const runtime = "edge";
// 設定快取 10 秒，避免太多人同時刷導致資料庫爆量
export const revalidate = 10;

export async function GET() {
  try {
    // 從 Redis 抓取 Wall of Fame 清單 (取前 50 筆)
    const feed = await kv.lrange("bucket_community_feed", 0, 49);
    
    // 如果是空的或 null，回傳空陣列
    return NextResponse.json(feed || []);
  } catch (error) {
    console.error("Community Feed Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}