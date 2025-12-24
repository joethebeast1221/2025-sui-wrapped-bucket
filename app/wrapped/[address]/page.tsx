/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, MouseEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { SuiYearlySummary } from "@/lib/types";
import { ShareImageButton } from "@/components/ShareImageButton";
import { TweetButton } from "@/components/TweetButton";
import { SocialFeed } from "@/components/SocialFeed";
import { QuestActions } from "@/components/QuestActions";
// ⚠️ 移除 getMockInteractedProtocols，只保留計算邏輯與列表
import { calculateAdvancedAP, PROTOCOL_LIST } from "@/lib/mockData";

const SEASON_END_DATE = new Date("2026-01-07T23:59:59");

// ✨ 雙面翻轉卡片組件 (全深色版)
function TiltFlipCard({ front, back }: { front: React.ReactNode, back: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false); 

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotate({ 
        x: ((y - centerY) / centerY) * -8, 
        y: ((x - centerX) / centerX) * 8 
    });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div 
      className="card-perspective relative group cursor-pointer z-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 底部陰影/光暈 */}
      <div className="absolute top-10 left-4 right-4 h-full bg-blue-500/20 blur-[60px] -z-10 rounded-full" />
      
      <div 
        ref={cardRef}
        className="card-inner relative w-[360px] h-[540px] rounded-[32px] transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <div 
            className="relative w-full h-full transition-all duration-700"
            style={{ 
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
        >
            {/* --- FRONT FACE (Full Bleed Dark Style) --- */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 shadow-2xl flex flex-col"
                style={{ 
                    backfaceVisibility: "hidden",
                }}
            >
                {/* 卡片紋理與光暈 */}
                <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]" />
                <div className="card-glare absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-60" />
                
                {/* 內容 */}
                <div className="relative z-10 h-full flex flex-col">
                    {front}
                </div>
            </div>

            {/* --- BACK FACE (Inventory/Matrix) --- */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 shadow-2xl flex flex-col"
                style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)",
                }}
            >
                 <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]" />
                 <div className="relative z-10 h-full flex flex-col">
                    {back}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function WrappedPage() {
  const params = useParams<{ address: string }>();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const address = params.address;
  const year = Number(searchParams.get("year") ?? "2025") || 2025;
  const suiNsName = searchParams.get("name");

  const [summary, setSummary] = useState<SuiYearlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePlayersCount, setActivePlayersCount] = useState(0); 
  
  // ⚠️ 移除 myProtocols 的 State，直接從 summary 讀取
  const anySession = session as any | null;
  const twitterHandle = anySession?.twitterHandle as string | undefined;
  const twitterPfpUrl = anySession?.twitterPfpUrl?.replace('_normal', '') as string | undefined;
  const shortAddress = address && address.length > 14 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/wrapped?address=${encodeURIComponent(address)}&year=${year}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load data.");
        const data = (await res.json()) as SuiYearlySummary;
        
        if (!cancelled) {
            setSummary(data);
            
            // ⚠️ 這裡不再需要 setMyProtocols(getMock...)，數據已經在 data.interactedProtocols 裡了
            
            setActivePlayersCount(1200 + Math.floor(Math.random() * 100));

            const duration = 3 * 1000;
            const end = Date.now() + duration;
            const interval: any = setInterval(() => {
                if (Date.now() > end) return clearInterval(interval);
                confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, particleCount: 50, origin: { x: Math.random(), y: Math.random() - 0.2 } });
            }, 250);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setErrorMsg("Could not fetch data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (address) load();
    return () => { cancelled = true; };
  }, [address, year]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white gap-6">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <div className="text-xl font-medium tracking-[0.2em] uppercase animate-pulse text-blue-300">Generating Card...</div>
      </main>
    );
  }

  if (errorMsg || !summary) return <div className="text-white p-10 text-center">{errorMsg}</div>;

  const avatarUrl = twitterPfpUrl || "/bucket-default-pfp.png"; 
  const displayHandle = twitterHandle ? `@${twitterHandle}` : (suiNsName || shortAddress);
  
  // ✨ 關鍵修改：從後端數據讀取真實交互過的協議
  const myProtocols = summary.interactedProtocols || []; 
  
  const result = calculateAdvancedAP(summary.totalTxCount, summary.activeDays, myProtocols.length);

  // --- 卡片正面 (Full Bleed Dark Style + Full Data + CTA) ---
  const CardFront = () => {
    const rewardAmount = summary.bucketAnnualReward 
        ? summary.bucketAnnualReward.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }) 
        : "$0";

    return (
        <div className="flex flex-col h-full font-sans relative">
            {/* 1. Header: Name & SP */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="font-bold text-lg text-white truncate max-w-[180px] tracking-tight">{displayHandle}</div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xl italic">
                    <span className="text-[10px] not-italic font-normal text-cyan-300/60 mr-1 mt-0.5">SP</span>
                    {result.score}
                </div>
            </div>

            {/* 2. Character Image */}
            <div className="px-6 py-5 flex-1 flex flex-col items-center justify-center min-h-0">
                <div className="relative aspect-square w-full max-w-[200px] rounded-2xl border-4 border-slate-700/50 overflow-hidden shadow-inner bg-gradient-to-b from-slate-800 to-black group">
                    <img src={avatarUrl} className="w-full h-full object-cover bucket-filter group-hover:scale-105 transition-transform duration-700" crossOrigin="anonymous" alt="pfp" />
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg">
                        <img src="/bucket-default-pfp.png" className="w-5 h-5" alt="water" />
                    </div>
                </div>
                
                <div className="mt-4 text-center w-full">
                    <h3 className="text-xl font-bold text-white mb-1">{result.rankTitle}</h3>
                    <p className="text-[10px] text-slate-400 font-light italic opacity-80 line-clamp-1 px-2">
                        "{result.rankDesc}"
                    </p>
                </div>
            </div>

            {/* 3. Stats Grid (Highlight Earn + Show TX/Days) */}
            <div className="px-5 pb-16"> {/* 留白給翻轉按鈕 */}
                <div className="grid grid-cols-2 gap-3">
                    
                    {/* Full width: Bucket Rewards */}
                    <div className="col-span-2 bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
                        <span className="text-[9px] text-blue-300 uppercase tracking-widest font-bold">Bucket Rewards</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 drop-shadow-sm font-mono tracking-tight">
                            {rewardAmount}
                        </span>
                    </div>

                    {/* Half width: TX */}
                    <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white font-mono leading-none">{summary.totalTxCount}</span>
                        <span className="text-[7px] text-slate-500 uppercase tracking-widest mt-1">Total Txs</span>
                    </div>

                    {/* Half width: Days */}
                    <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white font-mono leading-none">{summary.activeDays}</span>
                        <span className="text-[7px] text-slate-500 uppercase tracking-widest mt-1">Active Days</span>
                    </div>
                </div>
            </div>

            {/* 4. Footer & Flip Action */}
            <div className="absolute bottom-0 left-0 right-0">
                {/* ⚠️ 修正：將按鈕往上移至 bottom-12，避開 Footer 文字 */}
                <div className="absolute bottom-12 right-4 z-30 group cursor-pointer pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/90 border border-blue-400/50 shadow-lg shadow-blue-900/50 animate-bounce backdrop-blur-md">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider">View Footprint</span>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                </div>

                <div className="px-4 py-2 bg-black/60 text-[9px] text-slate-500 text-center uppercase tracking-[0.2em] flex justify-between border-t border-white/5 backdrop-blur-sm">
                    <span>Bucket Protocol</span>
                    <span>2025 Edition</span>
                </div>
            </div>
        </div>
    );
  };

  // --- 卡片背面 (3x3 Matrix - 使用真實數據) ---
  const CardBack = () => (
    <div className="h-full flex flex-col p-6 font-sans bg-[#080c14]">
        <div className="w-full flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-white tracking-wider">Inventory</span>
                <span className="text-[10px] text-slate-400">Protocols Activated</span>
            </div>
            <span className="text-sm font-mono text-cyan-300 bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                {myProtocols.length}/9
            </span>
        </div>

        {/* 3x3 Logo Grid */}
        <div className="grid grid-cols-3 gap-4 flex-1 content-start">
            {PROTOCOL_LIST.map((p, index) => {
                // 使用真實數據判斷是否點亮
                const isActive = myProtocols.includes(p);
                const isCenter = index === 4;

                return (
                    <div 
                        key={p} 
                        className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center border transition-all duration-500 relative overflow-hidden
                            ${isActive 
                                ? (isCenter 
                                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.6)] z-10 scale-105' 
                                    : 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]')
                                : 'bg-black/40 border-white/5 opacity-20 grayscale'
                            }
                        `}
                    >
                        <div className={`
                            w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-1 shadow-inner
                            ${isCenter ? 'bg-white text-blue-600' : (isActive ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' : 'bg-slate-800 text-slate-500')}
                        `}>
                            {p[0]}
                        </div>
                        <span className={`text-[8px] uppercase tracking-wider font-bold ${isCenter ? 'text-white' : 'text-slate-300'}`}>
                            {p}
                        </span>
                    </div>
                )
            })}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Synergy Boost</span>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 font-mono">
                x{result.multiplier.toFixed(1)}
            </div>
        </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-[#020408] font-sans relative overflow-x-hidden transition-colors">
      
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-pink-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <img src="/bucket-default-pfp.png" className="w-6 h-6" alt="Logo" />
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Bucket Labs</span>
        </div>
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition px-4 py-2">
            START OVER
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-[60vh] gap-12 lg:gap-24 px-6 pb-12 pt-8">
        
        {/* Left: Text & Actions */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8 max-w-lg">
            <div>
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-4">
                    Your Bucket <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Top Signal</span> Card
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                    Generated from your on-chain activity in 2025.
                </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 w-full">
                {/* Actions */}
                <div className="w-full sm:w-auto min-w-[140px] [&>button]:!bg-blue-50 [&>button]:!text-blue-600 [&>button]:dark:!bg-blue-500/20 [&>button]:dark:!text-blue-200 [&>button]:!rounded-full [&>button]:!py-3 [&>button]:!border-0 [&>button]:!shadow-none [&>button]:hover:!scale-105">
                    <ShareImageButton twitterHandle={twitterHandle} shortAddress={shortAddress} summary={summary} twitterPfpUrl={avatarUrl} />
                </div>
                <div className="w-full sm:w-auto min-w-[140px] [&>button]:!bg-blue-600 [&>button]:!text-white [&>button]:!rounded-full [&>button]:!py-3 [&>button]:!border-0 [&>button]:!shadow-xl [&>button]:hover:!scale-105">
                    <TweetButton twitterHandle={twitterHandle} tier={result.rankTitle} txCount={summary.totalTxCount} />
                </div>
            </div>

            <div className="w-full mt-4">
                <QuestActions />
            </div>
        </div>

        {/* Right: The Card */}
        <div className="flex justify-center animate-float">
            {/* 隱藏的截圖用容器 (Front Only) */}
            <div className="absolute top-0 left-[-9999px]">
                <div 
                    id="share-card-export"
                    className="relative w-[360px] h-[540px] rounded-[32px] overflow-hidden bg-[#e0e5ec] border border-white/10 p-0"
                >
                     <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]" />
                    <div className="relative z-10 h-full flex flex-col">
                        <CardFront />
                    </div>
                </div>
            </div>

            <TiltFlipCard 
                front={<CardFront />} 
                back={<CardBack />} 
            />
        </div>

      </div>

      {/* Footer / Hall of Fame */}
      <div className="relative z-10 w-full border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center gap-2">
            <h3 className="text-center font-bold text-3xl text-slate-900 dark:text-white">Hall of Fame</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10">
                Join <span className="text-blue-500 font-bold">{activePlayersCount}</span> active players on the leaderboard.
            </p>
            <SocialFeed />
        </div>
      </div>

    </main>
  );
}