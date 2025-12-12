"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { calculateAdvancedAP, getMockInteractedProtocols } from "@/lib/mockData";

interface CommunityUser {
  address: string;
  handle: string | null;
  pfp: string | null;
  tx: number;
  days: number;
  tier: string;
}

export function SocialFeed() {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch(`/api/community?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Feed fetch failed", e);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  if (loading) return <div className="text-center py-20 text-xs text-slate-500 animate-pulse tracking-widest uppercase">Fetching Signals...</div>;

  if (users.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 border border-white/5 rounded-3xl bg-white/5">
        <div className="text-4xl opacity-50 mb-4">📡</div>
        <p className="text-slate-400 font-bold mb-1">No signals detected yet</p>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="flex flex-col items-start mb-8 space-y-2 border-l-2 border-blue-500 pl-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">The Signal Wall</h2>
        <p className="text-sm text-slate-400">
            Join <span className="text-blue-400 font-bold">{users.length}</span> active players on the leaderboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 place-items-center">
        {users.map((user, idx) => {
          const displayName = user.handle ? `@${user.handle}` : `${user.address.slice(0, 4)}...${user.address.slice(-4)}`;
          const avatar = user.pfp || "/bucket-default-pfp.png";
          
          // 使用 Mock Data 計算新版分數
          const protocols = getMockInteractedProtocols(user.address);
          const hasBucket = protocols.includes('Bucket');
          const result = calculateAdvancedAP(user.tx, user.days, protocols.length, hasBucket);

          const linkUrl = user.handle ? `https://twitter.com/${user.handle}` : "https://app.bucketprotocol.io/earn";

          return (
            <Link key={idx} href={linkUrl} target="_blank" rel="noopener noreferrer" className="group relative block w-full max-w-[240px] hover:-translate-y-2 transition-transform duration-300">
              <div className={`relative aspect-[3/4.8] rounded-[20px] overflow-hidden bg-[#080c14] border border-white/10 transition-all duration-500 shadow-xl group-hover:shadow-blue-900/20`} style={{ backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)" }}>
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-blue-900 to-black opacity-30 blur-xl" />
                
                <div className="relative h-full flex flex-col p-4 z-10 justify-between">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1 opacity-90">
                            <img src="/bucket-default-pfp.png" className="w-3 h-3" alt="Logo" />
                            <span className="text-[9px] font-bold tracking-tight text-white font-sans">Bucket</span>
                        </div>
                        <div className="px-1.5 py-0.5 rounded border border-cyan-500/20 bg-cyan-900/10 flex items-center gap-1">
                            <span className="text-[6px] text-cyan-400 uppercase tracking-wider font-bold">SP</span>
                            <span className="text-[8px] font-mono font-bold text-cyan-100">{result.score}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/5 blur-lg rounded-full" />
                            <div className={`relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-b from-blue-500 to-indigo-500 border border-white/10 overflow-hidden`}>
                                <img src={avatar} className="w-full h-full rounded-full object-cover bg-black bucket-filter" alt="Avatar" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <span className={`bg-[#050a10] border border-white/10 px-2 py-0.5 rounded-full text-[6px] font-bold uppercase tracking-wider text-blue-200 shadow`}>
                                    {result.rankTitle}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 text-center w-full px-1">
                            <div className="text-sm font-bold text-white truncate">{displayName}</div>
                            <p className="text-[7px] leading-3 text-slate-400 mt-1 font-light italic opacity-70 line-clamp-2">"{result.rankDesc}"</p>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-2 mt-1">
                        <div className="grid grid-cols-2 divide-x divide-white/5">
                            <div className="flex flex-col items-center"><span className="text-xs font-medium text-white font-mono">{user.tx}</span><span className="text-[6px] text-slate-500 uppercase tracking-wider">TXs</span></div>
                            <div className="flex flex-col items-center"><span className="text-xs font-medium text-white font-mono">{user.days}</span><span className="text-[6px] text-slate-500 uppercase tracking-wider">Days</span></div>
                        </div>
                    </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}