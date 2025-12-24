// lib/types.ts

export interface SuiYearlySummary {
  address: string;
  year: number;

  // 移除 totalTxCount, activeDays, activityTimeline, bucketAnnualReward

  // 核心數據：已交互的協議列表
  interactedProtocols: string[]; 

  personalityTags: string[];
  ogSentence: string;
}
