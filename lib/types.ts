// lib/types.ts

export interface ActivityTimelinePoint {
  month: string;      // '2025-01' .. '2025-12'
  txCount: number;
}

export interface SuiYearlySummary {
  address: string;
  year: number;

  totalTxCount: number;      // 改名：不再是 totalBucketTxCount
  activeDays: number;        // 改名：不再是 activeBucketDays

  firstTxDate?: string;
  lastTxDate?: string;

  activityTimeline: ActivityTimelinePoint[];

  personalityTags: string[];
  ogSentence: string;
}
