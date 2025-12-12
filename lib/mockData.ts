// lib/mockData.ts

export const PROTOCOL_LIST = [
  'Walrus', 'Suilend', 'Navi', 'Bluefin', 'Haedal', 'Bucket', 
  'Ember', 'Cetus', 'Momentum', 'Scallop', 'Magma', 'Aftermath', 
  'Alphafi', 'Deepbook', 'Ferra', 'Typus'
];

export interface ApResult {
  score: number;
  rankTitle: string;
  rankDesc: string;
  multiplier: number;
}

// 模擬：隨機回傳一些協議，假裝是用戶交互過的
export function getMockInteractedProtocols(address: string): string[] {
  // 利用地址長度做個簡單的偽隨機，讓同一個地址每次重新整理結果固定
  const count = (address.length % 10) + 2; // 產生 2 ~ 11 個協議
  const shuffled = [...PROTOCOL_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 新版 AP 與稱號計算公式 (符合 PRD)
export function calculateAdvancedAP(tx: number, days: number, protocolCount: number, hasBucket: boolean): ApResult {
  // 1. 基礎分
  const baseScore = (days * 20) + (tx * 1);
  
  // 2. 協議探索分 (每個 +300)
  const protocolScore = protocolCount * 300;
  
  // 3. 係數加成與稱號
  let multiplier = 1.0;
  let rankTitle = "The Drifter";
  let rankDesc = "You go where the current takes you. Just starting to feel the water.";

  if (protocolCount >= 10) {
      multiplier = 1.5;
      rankTitle = "The Poseidon";
      rankDesc = "You don't just swim in the ocean—you rule it. A true Sui Maximalist.";
  } else if (protocolCount >= 6) {
      multiplier = 1.2;
      rankTitle = "The Commander";
      rankDesc = "You command liquidity with precision. A true veteran of the deep.";
  } else if (protocolCount >= 3) {
      multiplier = 1.1;
      rankTitle = "The Navigator";
      rankDesc = "You've charted your own course. The ecosystem is opening up to you.";
  }

  // 特殊轉職：Bucket Pilot
  if (hasBucket && days > 30 && protocolCount < 10) {
      rankTitle = "The Bucket Pilot";
      rankDesc = "The depths call to you. A true believer in stability.";
  }
  
  // 特殊轉職：Grinder
  if (protocolCount < 5 && tx > 1000) {
      rankTitle = "The Grinder";
      rankDesc = "Pure focus. You picked a lane and dominated it with sheer force.";
  }

  const finalScore = Math.floor((baseScore + protocolScore) * multiplier);

  return {
    score: Math.min(99999, finalScore),
    rankTitle,
    rankDesc,
    multiplier
  };
}