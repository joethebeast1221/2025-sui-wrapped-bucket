"use client";

import React from "react";

const TWEET_ID = process.env.NEXT_PUBLIC_CAMPAIGN_TWEET_ID || "1865000000000000000";

export function QuestActions() {
  const likeUrl = `https://twitter.com/intent/like?tweet_id=${TWEET_ID}`;
  const retweetUrl = `https://twitter.com/intent/retweet?tweet_id=${TWEET_ID}`;
  const followUrl = `https://twitter.com/intent/follow?screen_name=bucket_protocol`;

  return (
    <div className="w-full flex flex-col gap-4 p-5 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-900/20 to-black/40 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]">
      <div className="text-center">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
          <span className="text-xl">🎁</span> Giveaway Quest
        </h3>
        <p className="text-[10px] text-blue-200/70">Complete tasks to join the raffle</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Like */}
        <a 
          href={likeUrl} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/50 rounded-xl transition-all hover:scale-105 group"
        >
          <svg className="w-6 h-6 text-slate-400 group-hover:text-pink-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span className="text-xs font-bold text-slate-300 group-hover:text-white">Like</span>
        </a>

        {/* Retweet */}
        <a 
          href={retweetUrl} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/50 rounded-xl transition-all hover:scale-105 group"
        >
          <svg className="w-6 h-6 text-slate-400 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"/></svg>
          <span className="text-xs font-bold text-slate-300 group-hover:text-white">Repost</span>
        </a>

        {/* Follow */}
        <a 
          href={followUrl} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all hover:scale-105 group"
        >
          <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span className="text-xs font-bold text-slate-300 group-hover:text-white">Follow</span>
        </a>
      </div>
    </div>
  );
}