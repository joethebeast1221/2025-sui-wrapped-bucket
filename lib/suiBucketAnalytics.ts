// lib/suiBucketAnalytics.ts
import { SuiYearlySummary, ActivityTimelinePoint } from "./types";

const SUI_GRAPHQL_URL = "https://graphql.mainnet.sui.io/graphql";

function normalizeSuiAddress(address: string): string | null {
  const trimmed = address.trim().toLowerCase();
  const no0x = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  return "0x" + no0x.padStart(64, "0");
  if (!/^[0-9a-f]+$/.test(no0x) || no0x.length > 64) return null;
}

// --- GraphQL Fetcher ---
async function fetchProtocolInteractions(address: string): Promise<string[]> {
  const interacted: string[] = []; // 預設包含 Bucket

  // 構建 Query：一次請求檢查所有協議
  const query = `
    query CheckProtocols($addr: SuiAddress!) {
      navi: events(filter: {sender: $addr, type: "0x834a86970ae93a73faf4fff16ae40bdb72b91c47be585fff19a2af60a19ddca3::logic::StateUpdated"}, last: 1) { nodes { timestamp } }

      bluefin: events(filter: {sender: $addr, type: "0x3492c874c1e3b3e2984e8c41b589e642d4d0a5d6459e5a9cfc2d52fd7c89c267::events::LiquidityProvided"}, last: 1) { nodes { timestamp } }

      suilend: events(filter: {sender: $addr, type: "0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf::reserve::InterestUpdateEvent"}, last: 1) { nodes { timestamp } }

      cetus: events(filter: {sender: $addr, type: "0xdb5cd62a06c79695bfc9982eb08534706d3752fe123b48e0144f480209b3117f::pool::AddLiquidityV2Event"}, last: 1) { nodes { timestamp } }

      deepbook: events(filter: {sender: $addr, type: "0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963357661df5d3204809::order_info::OrderPlaced"}, last: 1) { nodes { timestamp } }

      scallop_mint: events(filter: {sender: $addr, type: "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::mint::MintEvent"}, last: 1) { nodes { timestamp } }
      scallop_dep: events(filter: {sender: $addr, type: "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::deposit_collateral::CollateralDepositEvent"}, last: 1) { nodes { timestamp } }

      bucket_cdp: events(filter: {sender: $addr, type: "0x9f835c21d21f8ce519fec17d679cd38243ef2643ad879e7048ba77374be4036e::events::PositionUpdated"}, last: 1) { nodes { timestamp } }
      bucket_savings: events(filter: {sender: $addr, type: "0x872d08a70db3db498aa7853276acea8091fdd9871b2d86bc8dcb8524526df622::events::DepositEvent<0x38f61c75fa8407140294c84167dd57684580b55c3066883b48dedc344b1cde1e::susdb::SUSDB>"}, last: 1) { nodes { timestamp } }

      lake: events(filter: {sender: $addr, type: "0x839ebd53d7fd8cf4209b83a3937c3875968e2705156717c76760b3b64eef7e3a::stable_vault::Mint"}, last: 1) { nodes { timestamp } }

      walrus_obj: address(address: $addr) {
        objects(filter: { type: "0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77::staked_wal::StakedWal" }, last: 1) {
          nodes {
            address
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(SUI_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { addr: address },
      }),
    });

    const json = await res.json();

    // 如果 GraphQL 報錯 (例如請求太頻繁)，只回傳預設值
    if (json.errors) {
      console.warn("GraphQL Errors:", json.errors);
      return interacted;
    }

    const data = json.data;
    if (!data) return interacted;

    // 解析回傳資料
    // 對於 Event，只要 nodes 陣列長度 > 0 即表示有交互
    if (data.navi?.nodes?.length > 0) interacted.push("NAVI");
    if (data.bluefin?.nodes?.length > 0) interacted.push("Bluefin");
    if (data.suilend?.nodes?.length > 0) interacted.push("Suilend");
    if (data.cetus?.nodes?.length > 0) interacted.push("Cetus");
    if (data.deepbook?.nodes?.length > 0) interacted.push("Deepbook"); // 注意 UI 對應的名稱大小寫

    // Scallop: 只要 Mint 或 Deposit 任一有紀錄就算
    if (
      data.scallop_mint?.nodes?.length > 0 ||
      data.scallop_dep?.nodes?.length > 0
    ) {
      interacted.push("Scallop");
    }

    if (
      data.bucket_cdp?.nodes?.length > 0 ||
      data.bucket_savings?.nodes?.length > 0
    ) {
      interacted.push("Bucket");
    }

    if (data.lake?.nodes?.length > 0) {
      interacted.push("Lake");
    }

    // Walrus: 檢查是否持有該 Object
    if (data.walrus_obj?.objects?.nodes?.length > 0) {
      interacted.push("Walrus");
    }
  } catch (e) {
    console.error("Failed to fetch protocol interactions", e);
  }

  return interacted;
}

// 模擬 (或真實) 抓取 Bucket Reward
async function fetchBucketRewards(address: string): Promise<number> {
  try {
    // 這裡用模擬數據，實際上線可換成真實 API
    const seed = address.charCodeAt(address.length - 1) + address.charCodeAt(2);
    return ((seed * 1234) % 5000) + (seed % 100) / 100;
  } catch (e) {
    console.error("Failed to fetch bucket rewards", e);
    return 0;
  }
}

export async function buildSuiYearlySummary(
  address: string,
  year: number,
): Promise<SuiYearlySummary> {
  console.log(`[Analytics] Starting fetch for ${address} in ${year}`);

  const normalized = normalizeSuiAddress(address);
  if (!normalized) {
    throw new Error("Invalid address format");
  }

  // 1. 並行執行：GraphQL 查詢 & Bucket Rewards
  const protocolsPromise = fetchProtocolInteractions(normalized);
  const rewardsPromise = fetchBucketRewards(normalized);

  // 2. RPC 交易計數邏輯 (模擬)
  // ⚠️ 注意：為了簡化演示，這裡省略了真實的 RPC loop。
  // 在正式版中，請保留你原本用 client.queryTransactionBlocks 的程式碼
  const totalTxCount = 120 + Math.floor(Math.random() * 50);
  const activeDays = 30 + Math.floor(Math.random() * 20);
  const activityTimeline: ActivityTimelinePoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    activityTimeline.push({
      month: ym,
      txCount: Math.floor(Math.random() * 10),
    });
  }

  // 3. 等待所有數據
  const [interactedProtocols, bucketAnnualReward] = await Promise.all([
    protocolsPromise,
    rewardsPromise,
  ]);

  const personalityTags = ["Sui Explorer"];
  const ogSentence = "You are just dipping your toes into the Move ecosystem.";

  return {
    address,
    year,
    totalTxCount,
    activeDays,
    activityTimeline,
    personalityTags,
    ogSentence,
    bucketAnnualReward,
    interactedProtocols, // ✨ 這裡將回傳真實查詢到的協議列表
  };
}
