"use client";

interface TweetButtonProps {
  twitterHandle?: string;
  tier: string;
  txCount: number;
}

export function TweetButton({ twitterHandle, tier, txCount }: TweetButtonProps) {
  const handleTweet = () => {
    // 🔥 Growth Hack 文案：
    // 1. Tag @bucket_protocol (增加官方互動機會)
    // 2. 數據展示 (滿足炫耀心理)
    // 3. 邀請朋友 (CTA)
    const text = `Just minted my 2025 #Sui Legacy Card with @bucket_protocol! 🌊\n\n🏆 Rank: ${tier}\n⚡️ Activity: ${txCount} TXs\n\nCheck your on-chain status and get on the Wall of Fame 👇\n`;
    
    const url = "https://2025-sui-wrapped-bucket.vercel.app"; 
    
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    
    window.open(intentUrl, "_blank", "width=550,height=420");
  };

  return (
    <button
      onClick={handleTweet}
      className="flex-1 rounded-2xl bg-white text-black font-bold px-6 py-4 hover:scale-[1.02] active:scale-[0.98] transition shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 group"
    >
      <svg className="w-5 h-5 group-hover:text-[#1DA1F2] transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
      </svg>
      <span>Share on X</span>
    </button>
  );
}