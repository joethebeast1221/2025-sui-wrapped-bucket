// lib/types.ts

export interface BucketActivityTimelinePoint {
  month: string;      // '2025-01' .. '2025-12'
  txCount: number;
}

export interface BucketYearlySummary {
  address: string;
  year: number;

  totalBucketTxCount: number;
  activeBucketDays: number;

  firstBucketTxDate?: string;
  lastBucketTxDate?: string;

  activityTimeline: BucketActivityTimelinePoint[];

  personalityTags: string[];  // e.g. ['Zen Farmer']
  ogSentence: string;         // e.g. "You calmly farmed with Bucket all year."
}
