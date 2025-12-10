// app/api/community/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge"; 
export const revalidate = 30; // 每 30 秒更新一次快取

export async function GET() {
  try {
    // 從 Redis 列表讀取前 50 筆
    const feed = await kv.lrange("bucket_community_feed", 0, 49);
    return NextResponse.json(feed || [], { status: 200 });
  } catch (error) {
    console.error("Community Feed Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}