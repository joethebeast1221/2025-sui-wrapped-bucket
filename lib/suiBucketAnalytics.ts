import { SuiClient } from "@mysten/sui.js/client";
import { SuiYearlySummary, ActivityTimelinePoint } from "./types";

const SUI_RPC_URL = process.env.SUI_RPC_URL || "https://fullnode.mainnet.sui.io:443";

function normalizeSuiAddress(address: string): string | null {
  const trimmed = address.trim().toLowerCase();
  const no0x = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-f]+$/.test(no0x) || no0x.length > 64) return null;
  return "0x" + no0x.padStart(64, "0");
}

const client = new SuiClient({ url: SUI_RPC_URL });

export async function buildSuiYearlySummary(
  address: string,
  year: number
): Promise<SuiYearlySummary> {
  console.log(`[Analytics] Starting fetch for ${address} in ${year}`);
  
  const normalized = normalizeSuiAddress(address);
  if (!normalized) {
    throw new Error("Invalid address format");
  }

  const from = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
  const to = new Date(`${year}-12-31T23:59:59.999Z`).getTime();

  let hasNextPage = true;
  let cursor: string | null = null;
  let pageCount = 0;
  const MAX_PAGES = 30; // 降低頁數避免 timeout，30 頁大約 1500 筆交易

  const txDates: Date[] = [];
  const monthlyMap = new Map<string, number>();

  try {
    while (hasNextPage && pageCount < MAX_PAGES) {
      // console.log(`[Analytics] Fetching page ${pageCount + 1}...`);
      const page = await client.queryTransactionBlocks({
        filter: { FromAddress: normalized },
        cursor: cursor || undefined,
        limit: 50,
        order: "descending",
        // 關鍵：必須設定 showInput 或 showEffects 才能確保 timestampMs 被回傳
        options: { 
            showInput: true,
            showEffects: true 
        },
      });

      pageCount++;

      if (!page.data || page.data.length === 0) {
        break;
      }

      for (const tx of page.data) {
        const tsMs = tx.timestampMs ? Number(tx.timestampMs) : null;
        if (!tsMs) continue; // Skip if no timestamp

        // 檢查年份
        if (tsMs > to) continue; // 還沒到 2025 的交易 (理論上 descending 不會發生，除非系統時間錯亂)
        if (tsMs < from) {
          // 已經早於 2025，停止搜尋
          hasNextPage = false;
          break;
        }

        const date = new Date(tsMs);
        txDates.push(date);

        // 格式化月份 2025-01
        const ym = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(ym, (monthlyMap.get(ym) ?? 0) + 1);
      }

      if (hasNextPage && page.hasNextPage && page.nextCursor) {
        cursor = page.nextCursor;
      } else {
        hasNextPage = false;
      }
    }
  } catch (e: any) {
    console.error("[Analytics] RPC Error:", e.message);
    // 不拋出錯誤，而是回傳目前抓到的數據 (Partial data is better than no data)
  }

  console.log(`[Analytics] Finished. Total Txs found: ${txDates.length}`);

  // 初始化所有月份為 0，確保圖表不會斷掉
  const activityTimeline: ActivityTimelinePoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    activityTimeline.push({
      month: ym,
      txCount: monthlyMap.get(ym) ?? 0,
    });
  }

  // Handle empty case
  if (txDates.length === 0) {
    return {
      address,
      year,
      totalTxCount: 0,
      activeDays: 0,
      activityTimeline, // 就算沒資料也要回傳空的月份陣列
      personalityTags: ["Newcomer"],
      ogSentence: "Ready to start the journey on Sui.",
    };
  }

  const totalTxCount = txDates.length;
  const daySet = new Set(txDates.map((d) => d.toISOString().slice(0, 10)));
  const activeDays = daySet.size;

  // 排序日期找出第一筆和最後一筆
  const sortedDates = txDates.sort((a, b) => a.getTime() - b.getTime());
  const firstTxDate = sortedDates[0].toISOString();
  const lastTxDate = sortedDates[sortedDates.length - 1].toISOString();

  // Tags Logic
  const personalityTags: string[] = [];
  let ogSentence = "";

  if (totalTxCount < 10) {
    personalityTags.push("Just Looking");
    ogSentence = "You took a peek at Sui this year.";
  } else if (totalTxCount < 100) {
    personalityTags.push("Explorer");
    ogSentence = "You actively explored the ecosystem.";
  } else {
    personalityTags.push("Power User");
    ogSentence = "You are a core part of the Sui network.";
  }

  return {
    address,
    year,
    totalTxCount,
    activeDays,
    firstTxDate,
    lastTxDate,
    activityTimeline,
    personalityTags,
    ogSentence,
  };
}
