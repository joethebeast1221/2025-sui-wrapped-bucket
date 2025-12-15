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

// 模擬：隨機回傳一些協議，假裝是用戶交互過的
// 未來這裡會改成真實 API 判斷：checkProtocolInteractions(address)
export function getMockInteractedProtocols(address: string): string[] {
  // 必定包含 Bucket (因為是用戶來查 Bucket Wrapped)
  const interacted = ['Bucket'];
  
  // 利用地址做偽隨機，隨機增加其他協議
  const seed = address.charCodeAt(address.length - 1);
  
  PROTOCOL_LIST.forEach((p) => {
    if (p !== 'Bucket') {
      // 每個協議有 60% 機率顯示為已交互 (模擬活躍用戶)
      if ((seed + p.length) % 10 > 3) { 
        interacted.push(p);
      }
    }
  });
  
  return interacted;
}

// 根據交互數量給予評價
export function calculateAdvancedAP(tx: number, days: number, protocolCount: number): ApResult {
  // 1. 基礎分
  const baseScore = (days * 15) + (tx * 2);
  
  // 2. 協議探索分 (每個 +500，鼓勵多協議交互)
  const protocolScore = protocolCount * 500;
  
  // 3. 係數加成與稱號
  let multiplier = 1.0;
  let rankTitle = "Sui Explorer";
  let rankDesc = "You are just dipping your toes into the Move ecosystem.";

  if (protocolCount >= 8) {
      multiplier = 2.0;
      rankTitle = "Sui Maximalist";
      rankDesc = "You are the liquidity that flows through the entire network.";
  } else if (protocolCount >= 5) {
      multiplier = 1.5;
      rankTitle = "DeFi Strategist";
      rankDesc = "You know your way around the blue chips.";
  } else if (protocolCount >= 3) {
      multiplier = 1.2;
      rankTitle = "Active Voyager";
      rankDesc = "Building your portfolio, one protocol at a time.";
  }

  const finalScore = Math.floor((baseScore + protocolScore) * multiplier);

  return {
    score: Math.min(99999, finalScore),
    rankTitle,
    rankDesc,
    multiplier
  };
}