// lib/suiBucketAnalytics.ts
import { SuiYearlySummary } from "./types";
import { LRUCache } from "lru-cache";

// 1. Cache 設定：避免重複查詢消耗資源
const analyticsCache = new LRUCache<string, string[]>({
  max: 500,             // 最多存 500 人
  ttl: 1000 * 60 * 30,  // 快取 30 分鐘
});

// 2. URL 設定：改回您原本使用的 URL，確保數據源一致
const SUI_GRAPHQL_URL = "https://graphql.mainnet.sui.io/graphql";

function normalizeSuiAddress(address: string): string | null {
  const trimmed = address.trim().toLowerCase();
  const no0x = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-f]+$/.test(no0x) || no0x.length > 64) return null;
  return "0x" + no0x.padStart(64, "0");
}

// --- Protocol Fetcher ---
async function fetchProtocolInteractions(address: string): Promise<string[]> {
  // A. 檢查 Cache
  if (analyticsCache.has(address)) {
    return analyticsCache.get(address) || ["Bucket"];
  }

  const interacted: string[] = ["Bucket"]; 

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
    // B. 發送請求 (保留 AbortSignal 防止無限卡死，但設長一點)
    const res = await fetch(SUI_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { addr: address } }),
      signal: AbortSignal.timeout(15000) // 15秒超時，比之前寬鬆
    });

    // C. 防崩潰處理：先讀成文字
    const responseBody = await res.text();

    if (!res.ok) {
      console.warn(`[GraphQL Error] Status: ${res.status}`);
      return interacted; // 失敗時回傳預設值
    }

    let json: any;
    try {
      json = JSON.parse(responseBody);
    } catch (e) {
      console.error("Invalid JSON:", responseBody.slice(0, 100));
      return interacted;
    }

    // ✨✨ 關鍵修正：允許部分資料 (Partial Data) ✨✨
    // 即使 json.errors 存在，只要 data 有東西，我們就繼續處理
    // 舊版代碼在這裡會直接 return，導致資料遺失
    if (json.errors) {
      // 這裡只印警告，不中斷流程
      console.warn("GraphQL Partial Errors (ignoring to keep valid data):", json.errors.map((e:any) => e.message));
    }

    const data = json.data;
    if (!data) return interacted;

    // D. 解析邏輯 (保持完全不變)
    if (data.navi?.nodes?.length > 0) interacted.push("NAVI");
    if (data.bluefin?.nodes?.length > 0) interacted.push("Bluefin");
    if (data.suilend?.nodes?.length > 0) interacted.push("Suilend");
    if (data.cetus?.nodes?.length > 0) interacted.push("Cetus");
    if (data.deepbook?.nodes?.length > 0) interacted.push("Deepbook");

    if (data.scallop_mint?.nodes?.length > 0 || data.scallop_dep?.nodes?.length > 0) {
      interacted.push("Scallop");
    }

    if (data.bucket_cdp?.nodes?.length > 0 || data.bucket_savings?.nodes?.length > 0) {
       if (!interacted.includes("Bucket")) interacted.push("Bucket");
    }

    if (data.lake?.nodes?.length > 0) {
      interacted.push("Lake");
    }

    if (data.walrus_obj?.objects?.nodes?.length > 0) {
      interacted.push("Walrus");
    }

    const result = Array.from(new Set(interacted));

    // E. 寫入 Cache
    analyticsCache.set(address, result);

    return result;

  } catch (e) {
    console.error("Fetch protocol failed", e);
    return interacted;
  }
}

export async function buildSuiYearlySummary(
  address: string,
  year: number,
): Promise<SuiYearlySummary> {
  const normalized = normalizeSuiAddress(address);
  if (!normalized) {
    throw new Error("Invalid address format");
  }

  const interactedProtocols = await fetchProtocolInteractions(normalized);

  let personalityTags = ["Sui Explorer"];
  let ogSentence = "You are starting to discover the power of Move.";
  
  const count = interactedProtocols.length;

  if (count >= 8) {
      personalityTags = ["Move Degen"];
      ogSentence = "You live on-chain. The entire ecosystem is your playground.";
  } else if (count >= 5) {
      personalityTags = ["DeFi Voyager"];
      ogSentence = "You've explored the depths of the Sui ocean.";
  } else if (count >= 3) {
      personalityTags = ["Consistent Builder"];
      ogSentence = "Building your portfolio, one protocol at a time.";
  }

  return {
    address,
    year,
    personalityTags,
    ogSentence,
    interactedProtocols, 
  };
}