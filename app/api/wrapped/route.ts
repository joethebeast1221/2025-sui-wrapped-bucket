// app/api/wrapped/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; 
import { kv } from "@vercel/kv"; 
import { buildSuiYearlySummary } from "@/lib/suiBucketAnalytics";
import type { SuiYearlySummary } from "@/lib/types";
import { authOptions } from "../auth/[...nextauth]/route"; 

export const runtime = "nodejs";

function calculateTier(tx: number, days: number) {
  if (tx >= 1000 || days >= 100) return "tidal";
  if (tx >= 200 || days >= 30) return "current";
  if (tx >= 20 || days >= 5) return "stream";
  return "ripple";
}

// ✨ 後端也需要這個公式來進行排序
function calculatePower(tx: number, days: number): number {
  const score = (days * 10) + tx;
  return Math.min(9999, score);
}

function normalizeAddress(addr: string | null): string {
  if (!addr) return "";
  return addr.trim().toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawAddress = searchParams.get("address");
  const yearParam = searchParams.get("year");

  if (!rawAddress) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const address = normalizeAddress(rawAddress);
  const year = Number(yearParam ?? "2025") || 2025;

  try {
    const summary: SuiYearlySummary = await buildSuiYearlySummary(address, year);
    const session = await getServerSession(authOptions);
    const user = session as any;

    if (summary.totalTxCount > 0) {
      const tier = calculateTier(summary.totalTxCount, summary.activeDays);
      
      const userData = {
        address: address, 
        handle: user?.twitterHandle || null,
        pfp: user?.twitterPfpUrl || null,
        tx: summary.totalTxCount,
        days: summary.activeDays,
        tier: tier,
        timestamp: Date.now(),
      };

      try {
        // 1. 抓取目前名單 (擴大抓取範圍到 200，以免排序時遺漏潛在強者)
        const currentList = await kv.lrange("bucket_community_feed", 0, 199) || [];
        
        // 2. Map 去重
        const uniqueMap = new Map();
        currentList.forEach((item: any) => {
            if (item && item.address) {
                uniqueMap.set(normalizeAddress(item.address), item);
            }
        });
        // 插入/更新最新這筆
        uniqueMap.set(address, userData);

        // 3. 🔥 關鍵修改：改為按 AP (戰力) 排序 🔥
        const sortedList = Array.from(uniqueMap.values())
            .sort((a: any, b: any) => {
                // 先算 AP
                const apA = calculatePower(a.tx, a.days);
                const apB = calculatePower(b.tx, b.days);

                // 如果 AP 不同，AP 高的排前面 (降冪)
                if (apB !== apA) {
                    return apB - apA;
                }
                
                // 如果 AP 相同，越新的排前面 (降冪)
                return b.timestamp - a.timestamp;
            })
            .slice(0, 50); // 最後只取前 50 名強者

        // --- 寫入資料庫 ---
        const pipeline = kv.pipeline();

        // A. 更新 Wall of Fame (這是排行榜了)
        pipeline.del("bucket_community_feed"); 
        if (sortedList.length > 0) {
            // @ts-ignore
            pipeline.rpush("bucket_community_feed", ...sortedList as any[]);
        }

        // B. 永久名冊 (不變)
        pipeline.hset("bucket_user_registry", {
            [address]: JSON.stringify({
                ...userData,
                userAgent: request.headers.get("user-agent") || "unknown"
            })
        });

        await pipeline.exec();
        
      } catch (dbError) {
        console.error("DB Save Error:", dbError);
      }
    }

    return NextResponse.json(summary, { status: 200 });
  } catch (err: any) {
    console.error("Wrapped API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load Sui data." },
      { status: 500 }
    );
  }
}