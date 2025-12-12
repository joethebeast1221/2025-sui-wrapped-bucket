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
import { calculateAdvancedAP, getMockInteractedProtocols, PROTOCOL_LIST } from "@/lib/mockData";

const SEASON_END_DATE = new Date("2026-01-07T23:59:59");

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const calculate = () => {
      const diff = SEASON_END_DATE.getTime() - new Date().getTime();
      if (diff > 0) {
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0 };
    };
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-300 bg-blue-900/20 border border-blue-500/30 px-3 py-1.5 rounded-full animate-pulse">
      <span className="uppercase tracking-widest text-slate-400">Ends In:</span>
      <span className="font-bold text-white">{timeLeft.days}d {timeLeft.hours}h</span>
    </div>
  );
}

// ✨ 雙面翻轉卡片組件
function TiltFlipCard({ front, back }: { front: React.ReactNode, back: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false); // 控制翻轉狀態

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // 稍微減小傾斜角度，避免翻轉時穿模
    setRotate({ 
        x: ((y - centerY) / centerY) * -6, 
        y: ((x - centerX) / centerX) * 6 
    });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div 
      className="card-perspective relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)} // 點擊翻面
    >
      <div className="absolute top-10 left-0 right-0 h-full bg-blue-900/40 blur-[80px] -z-10" />
      
      {/* Tilt Container */}
      <div 
        ref={cardRef}
        className="card-inner relative w-[340px] h-[540px] rounded-[32px] transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Flip Container */}
        <div 
            className="relative w-full h-full transition-all duration-700"
            style={{ 
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
        >
            {/* --- FRONT FACE --- */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border-2 border-white/10 shadow-2xl"
                style={{ 
                    backfaceVisibility: "hidden", // 背面隱藏
                    backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)" 
                }}
            >
                <div className="card-glare absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-50" />
                {front}
                
                {/* 翻轉提示 icon */}
                <div className="absolute bottom-4 right-4 z-30 opacity-50 animate-bounce">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
            </div>

            {/* --- BACK FACE --- */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#05080f] border-2 border-cyan-500/20 shadow-2xl"
                style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)", // 預先旋轉 180 度
                    backgroundImage: "radial-gradient(circle at center, #111827 0%, #000000 100%)"
                }}
            >
                {back}
                {/* 返回正面提示 */}
                <div className="absolute bottom-4 right-4 z-30 opacity-30">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
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
  
  const [myProtocols, setMyProtocols] = useState<string[]>([]);

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
            setMyProtocols(getMockInteractedProtocols(address)); 
            
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
        <div className="text-xl font-medium tracking-[0.3em] uppercase animate-pulse text-blue-300">Minting...</div>
      </main>
    );
  }

  if (errorMsg || !summary) return <div className="text-white p-10 text-center">{errorMsg}</div>;

  const avatarUrl = twitterPfpUrl || "/bucket-default-pfp.png"; 
  const displayHandle = twitterHandle ? `@${twitterHandle}` : (suiNsName || shortAddress);
  const hasBucket = myProtocols.includes('Bucket');
  const result = calculateAdvancedAP(summary.totalTxCount, summary.activeDays, myProtocols.length, hasBucket);

  // --- 卡片正面內容 (Personal Stats) ---
  const CardFront = () => (
    <div className="relative h-full flex flex-col justify-between z-10">
        {/* Top */}
        <div className="w-full flex justify-between items-center px-6 pt-6 pb-2 shrink-0">
            <div className="flex items-center gap-2 opacity-95">
                <img src="/bucket-default-pfp.png" className="w-6 h-6" alt="Bucket Logo" />
                <span className="text-xl font-bold tracking-tight text-white font-sans">Bucket</span>
            </div>
            <div className="group relative cursor-help px-3 py-1 rounded border border-cyan-500/30 bg-cyan-900/20 flex items-center gap-1.5">
                <span className="text-[8px] text-cyan-400 uppercase tracking-wider font-bold">SP Score</span>
                <span className="text-xs font-mono font-bold text-cyan-100">{result.score}</span>
            </div>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-6 -mt-4">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-110" />
                <div className={`relative w-36 h-36 rounded-full p-1 bg-gradient-to-b from-blue-400 to-indigo-600 border-[3px] border-white/10 overflow-hidden shadow-2xl`}>
                    <img src={avatarUrl} className="w-full h-full rounded-full object-cover bg-[#0a0f1c] scale-105 bucket-filter" crossOrigin="anonymous" alt="pfp" />
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full pointer-events-none"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-[#050a12] border border-white/20 px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                            {result.rankTitle}
                        </span>
                      </div>
                </div>
            </div>
            <div className="text-center w-full">
                <h2 className="text-3xl font-bold text-white tracking-tight truncate px-2 drop-shadow-lg">{displayHandle}</h2>
                <div className="mt-4 px-4">
                    <p className="text-xs leading-5 text-slate-300 font-light italic opacity-80">
                        "{result.rankDesc}"
                    </p>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="w-full grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 py-5 shrink-0 bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1"><span className="text-2xl font-medium text-white font-mono">{summary.totalTxCount}</span><span className="text-[8px] text-slate-500 uppercase tracking-[0.25em]">Transactions</span></div>
            <div className="flex flex-col items-center gap-1"><span className="text-2xl font-medium text-white font-mono">{summary.activeDays}</span><span className="text-[8px] text-slate-500 uppercase tracking-[0.25em]">Active Days</span></div>
        </div>
    </div>
  );

  // --- 卡片背面內容 (Ecosystem Footprint) ---
  const CardBack = () => (
    <div className="relative h-full flex flex-col p-6 z-10">
        <div className="w-full flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <span className="text-sm font-bold text-white tracking-wider">Ecosystem Footprint</span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-500/20">
                {myProtocols.length} / {PROTOCOL_LIST.length}
            </span>
        </div>

        {/* Logo Grid - 充滿整個背面 */}
        <div className="grid grid-cols-4 gap-3">
            {PROTOCOL_LIST.map((p) => {
                const active = myProtocols.includes(p);
                return (
                    <div key={p} className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all duration-300 ${active ? 'bg-blue-500/10 border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5 opacity-30 grayscale'}`}>
                        {/* 這裡未來換成真實 Logo 圖片 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${active ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {p[0]}
                        </div>
                        <span className="text-[8px] uppercase tracking-wider text-center w-full truncate px-1">{p}</span>
                    </div>
                )
            })}
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 text-center">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Synergy Multiplier</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                x{result.multiplier.toFixed(1)}
            </p>
        </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020408] text-white font-sans relative overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Column (Sticky) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center py-12 px-6 lg:h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#020408]/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
                
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Your 2025 Legacy</h1>
                    <CountdownTimer />
                </div>

                <div className="animate-float">
                    {/* ✨ 使用新的雙面翻轉卡片 */}
                    <TiltFlipCard 
                        front={<CardFront />} 
                        back={<CardBack />} 
                    />
                </div>

                {/* 下載用的隱藏卡片 (維持只下載正面，因為圖片是靜態的) */}
                <div className="absolute top-0 left-[-9999px]">
                    <div 
                        id="share-card-export"
                        className="relative w-[340px] h-[540px] bg-[#080c14] rounded-[32px] border border-white/20 p-0 flex flex-col justify-between text-center overflow-hidden"
                        style={{ backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)" }}
                    >
                        <CardFront />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <TweetButton twitterHandle={twitterHandle} tier={result.rankTitle} txCount={summary.totalTxCount} />
                        <ShareImageButton twitterHandle={twitterHandle} shortAddress={shortAddress} summary={summary} twitterPfpUrl={avatarUrl} />
                    </div>
                    <QuestActions />
                    <Link href="/" className="text-center text-xs text-slate-500 hover:text-white transition mt-2">← Check another address</Link>
                </div>
            </div>
        </div>

        <div className="lg:col-span-7 bg-black/20">
            <div className="py-12 px-6 lg:px-12">
                <SocialFeed />
            </div>
        </div>

      </div>
    </main>
  );
}