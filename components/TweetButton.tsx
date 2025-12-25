"use client";

// 1️⃣ 改用新的 X icon (需要從 fa6 引入)
import { FaXTwitter } from "react-icons/fa6";

interface TweetButtonProps {
  twitterHandle?: string;
  tier: string;
  protocolCount: number;
}

export function TweetButton({ twitterHandle, tier, protocolCount }: TweetButtonProps) {
  // 2️⃣ 將分享網址固定為指定的 Vercel 網址
  const shareUrl = 'https://2025-sui-wrapped-bucket.vercel.app/';

  const text = `Just minted my 2025 #Sui Legacy Card with @bucket_protocol! 🌊\n\n🏆 Rank: ${tier}\n🧩 Protocols Activated: ${protocolCount}/9\n\nCheck your on-chain status and get on the Wall of Fame 👇\n`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      // 3️⃣ 修改樣式：背景改為黑色 (bg-black)，hover 改為深灰色 (hover:bg-neutral-800)
      className="flex items-center justify-center gap-2 px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold transition-transform hover:scale-105 shadow-xl cursor-pointer border border-white/10"
    >
      {/* 4️⃣ 使用新的 X icon */}
      <FaXTwitter className="text-lg" />
      <span>Share Result</span>
    </a>
  );
}