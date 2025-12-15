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
  bucketAnnualReward?: number; // ✨ 新增：Bucket 年度總收益

  firstTxDate?: string;
  lastTxDate?: string;

  activityTimeline: ActivityTimelinePoint[];

  personalityTags: string[];
  ogSentence: string;
}
