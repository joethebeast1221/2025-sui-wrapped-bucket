// lib/suiBucketAnalytics.ts
import { SuiClient } from "@mysten/sui.js/client";
import { SuiYearlySummary, ActivityTimelinePoint } from "./types";

const SUI_RPC_URL = process.env.SUI_RPC_URL || "https://api.us1.shinami.com/sui/node/v1/us1_sui_mainnet_06c80a7299974a0d934f61caa6efb31e";

// ... (保留原本的 normalizeSuiAddress 函式) ...
function normalizeSuiAddress(address: string): string | null {
  const trimmed = address.trim().toLowerCase();
  const no0x = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-f]+$/.test(no0x) || no0x.length > 64) return null;
  return "0x" + no0x.padStart(64, "0");
}

const client = new SuiClient({ url: SUI_RPC_URL });

// ✨ Helper: 模擬 (或真實) 抓取 Bucket Reward
async function fetchBucketRewards(address: string): Promise<number> {
  try {
    // TODO: 正式上線時打開這裡
    /*
    const res = await fetch(`https://bucket-backend-mono-production.up.railway.app/api/rewards/history?address=${address}`);
    const data = await res.json();
    // 假設回傳格式是 { total: 123.45, ... }，請根據真實 API 調整
    return data.total || 0;
    */

    // 🚧 目前：回傳 Mock 數據 (0 ~ 5000 USD)
    // 利用地址產生固定的 "偽隨機" 數字，讓同一個人每次刷都一樣
    const seed = address.charCodeAt(address.length - 1) + address.charCodeAt(2);
    return (seed * 1234) % 5000 + (seed % 100) / 100; 
  } catch (e) {
    console.error("Failed to fetch bucket rewards", e);
    return 0;
  }
}

export async function buildSuiYearlySummary(
  address: string,
  year: number
): Promise<SuiYearlySummary> {
  console.log(`[Analytics] Starting fetch for ${address} in ${year}`);
  
  const normalized = normalizeSuiAddress(address);
  if (!normalized) {
    throw new Error("Invalid address format");
  }

  // ... (保留原本的 RPC 抓取邏輯: from, to, loop transactions...) ...
  // (為了節省篇幅，這裡省略中間 RPC 查詢部分，請保留你原本的程式碼)
  // ...
  
  // 假設這邊已經跑完 RPC 拿到 txDates
  // 如果你需要完整代碼我再貼，但基本上只需要在 return 前面插入 fetchBucketRewards

  // 為了演示，我直接模擬 txDates 為空或有值的狀況 (請保留你原本的邏輯)
  const txDates: Date[] = []; // ⚠️ 請確保這行是你原本代碼裡的
  const monthlyMap = new Map<string, number>(); // ⚠️ 保留原本的
  
  // ... (原本的 RPC Loop) ...

  // === 在這裡加入 Reward 查詢 ===
  const bucketReward = await fetchBucketRewards(normalized);

  // 初始化 Timeline
  const activityTimeline: ActivityTimelinePoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    activityTimeline.push({
      month: ym,
      txCount: 0, // 簡化
    });
  }

  // 構建回傳物件 (請將此處與你原本的 return 合併)
  // 這裡假設你已經算好了 totalTxCount, activeDays 等
  
  // ⚠️ 這裡僅是示意，請保留你原本計算 totalTxCount 的邏輯，重點是加入 bucketAnnualReward
  const totalTxCount = 123; // 替換為真實計算值
  const activeDays = 45;    // 替換為真實計算值
  const personalityTags = ["Sui Whale"]; // 替換為真實邏輯
  const ogSentence = "You are amazing."; // 替換為真實邏輯

  return {
    address,
    year,
    totalTxCount, // 使用計算後的值
    activeDays,   // 使用計算後的值
    activityTimeline,
    personalityTags,
    ogSentence,
    bucketAnnualReward: bucketReward, // ✨ 新增這行
  };
}
