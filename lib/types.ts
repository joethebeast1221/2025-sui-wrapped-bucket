// lib/types.ts

export interface ActivityTimelinePoint {
  month: string;
  txCount: number;
}

export interface SuiYearlySummary {
  address: string;
  year: number;

  totalTxCount: number;
  activeDays: number;
  bucketAnnualReward?: number; 

  firstTxDate?: string;
  lastTxDate?: string;

  activityTimeline: ActivityTimelinePoint[];

  // ✨ 新增：已交互的協議列表 (後端 GraphQL 查完後填入這裡)
  interactedProtocols: string[]; 

  personalityTags: string[];
  ogSentence: string;
}
