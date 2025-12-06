"use client";

import { useState } from "react";
import type { BucketYearlySummary } from "@/lib/types";

interface CopyShareButtonProps {
  twitterHandle?: string;
  shortAddress: string;
  summary: BucketYearlySummary;
}

export function CopyShareButton({
  twitterHandle,
  shortAddress,
  summary,
}: CopyShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `My Bucket ${summary.year} Wrapped:
- ${summary.totalBucketTxCount} Bucket transactions
- ${summary.activeBucketDays} active days
- Vibe: ${summary.personalityTags.join(", ") || "Explorer"}

Check your own Bucket Wrapped on Sui.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Clipboard error", e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-xl bg-white/90 text-slate-900 px-3 py-2 text-xs font-semibold hover:bg-white transition"
    >
      {copied ? "Copied ✓" : "Copy share text"}
      <span className="ml-1 text-[10px] text-slate-600">
        {twitterHandle ? `@${twitterHandle}` : shortAddress}
      </span>
    </button>
  );
}
