// lib/mockData.ts

// 3x3 矩陣順序：Bucket 在中間 (Index 4)
export const PROTOCOL_LIST = [
  'NAVI',    'Suilend', 'Bluefin',
  'Lake',    'Bucket',  'Cetus',
  'Scallop', 'Walrus',  'Deepbook'
];

export interface ApResult {
  score: number;
  rankTitle: string;
  rankDesc: string;
  multiplier: number;
}

// 模擬：保留此 helper
export function getMockInteractedProtocols(address: string): string[] {
  return ['Bucket'];
}

// ✨ 修改後：根據「協議數量」+「地址隨機性」計算分數
export function calculateAdvancedAP(protocolCount: number, address: string): ApResult {
  // 1. 基礎分：每個協議給予 1000 分
  const baseScore = protocolCount * 1000;

  // 2. 隨機加分 (Luck Bonus)
  // 利用地址產生偽隨機數 (Pseudo-random based on address)，確保同一人分數固定
  let randomBonus = 0;
  if (address) {
      let hash = 0;
      for (let i = 0; i < address.length; i++) {
          hash = (hash << 5) - hash + address.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
      }
      // 產生 0 ~ 999 的隨機加分
      randomBonus = Math.abs(hash) % 1000;
  }
  
  // 3. 係數加成與稱號判定
  let multiplier = 1.0;
  let rankTitle = "Sui Explorer";
  let rankDesc = "You are just dipping your toes into the Move ecosystem.";

  if (protocolCount >= 8) {
      // 8~9 個協議
      multiplier = 2.5; 
      rankTitle = "Sui Maximalist";
      rankDesc = "You are the liquidity that flows through the entire network.";
  } else if (protocolCount >= 5) {
      // 5~7 個協議
      multiplier = 1.5;
      rankTitle = "DeFi Strategist";
      rankDesc = "You know your way around the blue chips.";
  } else if (protocolCount >= 3) {
      // 3~4 個協議
      multiplier = 1.2;
      rankTitle = "Active Voyager";
      rankDesc = "Building your portfolio, one protocol at a time.";
  }

  // 計算最終分數： (基礎分 + 隨機分) * 倍率
  const finalScore = Math.floor((baseScore + randomBonus) * multiplier);

  return {
    score: Math.min(99999, finalScore),
    rankTitle,
    rankDesc,
    multiplier
  };
}