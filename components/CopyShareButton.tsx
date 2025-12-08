// components/CopyShareButton.tsx
"use client";

import { useState } from "react";

export interface CopyShareButtonProps {
  address: string;
  year: number;
}

export function CopyShareButton({ address, year }: CopyShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shortAddress =
    address && address.length > 14
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  const handleCopy = async () => {
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://2025-sui-wrapped-bucket.vercel.app";

      const url = `${baseUrl}/wrapped/${address}?year=${year}`;

      const shareText = `My Sui ${year} Wrapped is live.\nAddress: ${shortAddress}\n${url}\n\nGenerated with Bucket.`;

      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy share text", err);
      alert("Failed to copy. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-2xl border border-white/25 text-[11px] text-slate-100 px-3 py-1.5 hover:border-white/60 hover:bg-white/5 transition"
    >
      {copied ? "Copied!" : "Copy share text"}
    </button>
  );
}

