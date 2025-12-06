// lib/suiBucketAnalytics.ts
import { SuiClient } from "@mysten/sui.js/client";
import { BucketYearlySummary, BucketActivityTimelinePoint } from "./types";

const SUI_RPC_URL = process.env.SUI_RPC_URL!;

// 1) 先把 address 變成標準 Sui 形式：0x + 64 位 hex
function normalizeSuiAddress(address: string): string | null {
  const trimmed = address.trim().toLowerCase();
  const no0x = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;

  if (!/^[0-9a-f]+$/.test(no0x)) {
    return null;
  }
  if (no0x.length > 64) {
    return null;
  }

  const padded = no0x.padStart(64, "0");
  return "0x" + padded;
}

// TODO: 這裡之後換成真正的 Bucket package Id
const BUCKET_PACKAGE_IDS: string[] = [
  // "0x<your-bucket-package-id-1>",
];

const client = new SuiClient({ url: SUI_RPC_URL });

function isBucketTx(tx: any): boolean {
  if (BUCKET_PACKAGE_IDS.length === 0) {
    // 目前先把「所有 tx」當 demo，之後再用 packageId 篩
    return true;
  }

  const events = (tx as any).events;
  if (events) {
    for (const ev of events) {
      const pkg = (ev as any).packageId || (ev as any).package || (ev as any).sender;
      if (pkg && BUCKET_PACKAGE_IDS.includes(pkg)) return true;
    }
  }
  return false;
}

export async function buildBucketYearlySummary(
  address: string,
  year: number
): Promise<BucketYearlySummary> {
  const normalized = normalizeSuiAddress(address);

  if (!normalized) {
    // 地址格式不合法 → 不打 RPC，直接回一個空 summary
    return {
      address,
      year,
      totalBucketTxCount: 0,
      activeBucketDays: 0,
      activityTimeline: [],
      personalityTags: [],
      ogSentence: "Invalid Sui address format.",
    };
  }

  const from = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
  const to = new Date(`${year}-12-31T23:59:59.999Z`).getTime();

  let hasNextPage = true;
  let cursor: string | null = null;

  const bucketDates: Date[] = [];
  const monthlyMap = new Map<string, number>();

  while (hasNextPage) {
    const page = await client.queryTransactionBlocks({
      filter: { FromAddress: normalized }, // 👈 用正規化後的地址
      cursor: cursor || undefined,
      limit: 50,
      order: "ascending",
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
      },
    });

    for (const tx of page.data) {
      const tsMs = tx.timestampMs ? Number(tx.timestampMs) : null;
      if (!tsMs) continue;

      if (tsMs < from || tsMs > to) continue;
      if (!isBucketTx(tx)) continue;

      const date = new Date(tsMs);
      bucketDates.push(date);

      const ym = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}`;

      monthlyMap.set(ym, (monthlyMap.get(ym) ?? 0) + 1);
    }

    if (page.hasNextPage && page.nextCursor) {
      cursor = page.nextCursor;
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }
  }

  if (bucketDates.length === 0) {
    return {
      address,
      year,
      totalBucketTxCount: 0,
      activeBucketDays: 0,
      activityTimeline: [],
      personalityTags: [],
      ogSentence: "No Bucket activity found for this year.",
    };
  }

  const totalBucketTxCount = bucketDates.length;

  const daySet = new Set(
    bucketDates.map((d) => d.toISOString().slice(0, 10))
  );
  const activeBucketDays = daySet.size;

  const sortedDates = [...bucketDates].sort((a, b) => a.getTime() - b.getTime());
  const firstBucketTxDate = sortedDates[0].toISOString();
  const lastBucketTxDate = sortedDates[sortedDates.length - 1].toISOString();

  const activityTimeline: BucketActivityTimelinePoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    activityTimeline.push({
      month: ym,
      txCount: monthlyMap.get(ym) ?? 0,
    });
  }

  const personalityTags: string[] = [];
  let ogSentence = "";

  if (totalBucketTxCount < 10) {
    personalityTags.push("Quiet Observer");
    ogSentence = "You quietly explored Bucket this year.";
  } else if (totalBucketTxCount < 100) {
    personalityTags.push("Active User");
    ogSentence = "You actively used Bucket throughout the year.";
  } else {
    personalityTags.push("Power User");
    ogSentence = "You were a true Bucket power user in this year.";
  }

  return {
    address,
    year,
    totalBucketTxCount,
    activeBucketDays,
    firstBucketTxDate,
    lastBucketTxDate,
    activityTimeline,
    personalityTags,
    ogSentence,
  };
}
