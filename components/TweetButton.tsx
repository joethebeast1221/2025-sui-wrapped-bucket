"use client";

interface TweetButtonProps {
  twitterHandle?: string;
  tier: string;
  protocolCount: number;
}

// 直接定義 X (Twitter) 的 SVG Icon，不依賴外部套件
function XIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      aria-hidden="true" 
      fill="currentColor" 
      className={className}
      width="1em" 
      height="1em"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TweetButton({ twitterHandle, tier, protocolCount }: TweetButtonProps) {
  // 固定分享網址
  const shareUrl = 'https://2025-sui-wrapped-bucket.vercel.app/';

  const text = `Just minted my 2025 #Sui Legacy Card with @bucket_protocol! 🌊\n\n🏆 Rank: ${tier}\n🧩 Protocols Activated: ${protocolCount}/9\n\nCheck your on-chain status and get on the Wall of Fame 👇\n`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      // 保持黑色背景樣式
      className="flex items-center justify-center gap-2 px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold transition-transform hover:scale-105 shadow-xl cursor-pointer border border-white/10"
    >
      {/* 使用自定義的 X Icon */}
      <XIcon className="text-lg" />
      <span>Share Result</span>
    </a>
  );
}