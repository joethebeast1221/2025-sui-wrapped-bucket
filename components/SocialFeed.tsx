"use client";

import { useEffect, useState } from "react";
import { calculateAdvancedAP } from "@/lib/mockData";
import { CardFront } from "@/components/CardFront";

interface LeaderboardUser {
  address: string;
  score: number;
  tier: string;
  protocolCount: number;
  handle?: string; // ✨ 新增選填欄位
  avatar?: string; // ✨ 新增選填欄位
}

export function SocialFeed() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchData = async (pageNum: number) => {
    try {
      const res = await fetch(`/api/leaderboard?page=${pageNum}&limit=9`);
      if (res.ok) {
        const data = await res.json();
        
        setTotalCount(data.total || 0);
        setHasMore(data.hasMore);

        if (pageNum === 1) {
          setUsers(data.users);
        } else {
          setUsers(prev => [...prev, ...data.users]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchData(nextPage);
  };

  if (loading && page === 1) {
    return (
        <div className="w-full text-center py-10">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="text-center mb-4">
         <h3 className="font-bold text-3xl text-slate-900 dark:text-white mb-2">Hall of Fame</h3>
         <p className="text-slate-500 dark:text-slate-400">
            Join <span className="text-blue-500 font-bold text-xl">{totalCount}</span> active players on the leaderboard.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {users.map((user, i) => {
          const { rankDesc } = calculateAdvancedAP(user.protocolCount, user.address);
          // 如果有 handle 就顯示 @handle，否則顯示地址
          const displayName = user.handle ? `@${user.handle}` : `${user.address.slice(0, 4)}...${user.address.slice(-4)}`;
          // 決定連結：有 handle 連推特，沒 handle 連區塊鏈瀏覽器
          const linkUrl = user.handle 
            ? `https://twitter.com/${user.handle}`
            : `https://suiscan.xyz/mainnet/account/${user.address}`;
          
          return (
            <div key={`${user.address}-${i}`} className="flex justify-center transform hover:scale-[1.02] transition-transform duration-300">
               <div className="w-[300px] h-[450px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative">
                  {/* ✨ 全卡面連結 */}
                  <a 
                    href={linkUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-50 cursor-pointer"
                    title={user.handle ? `View @${user.handle} on Twitter` : "View on SuiScan"}
                  />
                  
                  {/* ✨ 使用 CardFront，傳入 hideButton={true} */}
                  <CardFront 
                    displayHandle={displayName}
                    score={user.score}
                    rankTitle={user.tier}
                    rankDesc={rankDesc}
                    // 有存頭像就用存的，沒有就用預設
                    avatarUrl={user.avatar || "/bucket-default-pfp.png"}
                    protocolCount={user.protocolCount}
                    hideButton={true} // 隱藏按鈕
                  />
               </div>
            </div>
          );
        })}
      </div>
      
      {users.length === 0 && !loading && (
          <div className="text-slate-500">Be the first to create your card!</div>
      )}

      {hasMore && (
        <div className="pt-4 pb-10">
          <button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold tracking-widest uppercase text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingMore ? "Loading..." : "Show More Players ↓"}
          </button>
        </div>
      )}
    </div>
  );
}