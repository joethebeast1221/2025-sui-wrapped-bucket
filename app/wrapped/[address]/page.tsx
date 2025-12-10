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
import { CopyShareButton } from "@/components/CopyShareButton";
import { SocialFeed } from "@/components/SocialFeed";

const SEASON_END_DATE = new Date("2026-01-07T23:59:59");

type SuiTierId = "ripple" | "stream" | "current" | "tidal";

interface SuiTierInfo {
  id: SuiTierId;
  name: string;
  color: string;
  bgGradient: string;
  border: string;
  shortLine: string;
  longStory: string;
}

function calculatePower(tx: number, days: number): number {
  const score = (days * 10) + tx;
  return Math.min(9999, score);
}

function getSuiTier(totalTx: number, activeDays: number): SuiTierInfo {
  let id: SuiTierId;
  if (totalTx >= 1000 || activeDays >= 100) id = "tidal";
  else if (totalTx >= 200 || activeDays >= 30) id = "current";
  else if (totalTx >= 20 || activeDays >= 5) id = "stream";
  else id = "ripple";

  switch (id) {
    case "ripple":
      return { 
        id, name: "RIPPLE", color: "text-blue-200", 
        bgGradient: "from-blue-900 via-slate-900 to-black", border: "border-blue-500/30",
        shortLine: "The Observer", 
        longStory: `You started your journey with ${totalTx} interactions. Like a droplet, you created small ripples on the surface.` 
      };
    case "stream":
      return { 
        id, name: "STREAM", color: "text-cyan-200", 
        bgGradient: "from-cyan-900 via-blue-900 to-black", border: "border-cyan-500/30",
        shortLine: "The Navigator", 
        longStory: `Consistent and purposeful. Over ${activeDays} active days, you flowed through the Sui ecosystem with steady progress.` 
      };
    case "current":
      return { 
        id, name: "CURRENT", color: "text-sky-200", 
        bgGradient: "from-sky-700 via-indigo-900 to-black", border: "border-sky-400/40",
        shortLine: "The Voyager", 
        longStory: `You moved with the pulse of Sui. Your ${totalTx} transactions weren't just volume; they were directional force.` 
      };
    case "tidal":
    default:
      return { 
        id, name: "TIDAL FORCE", color: "text-purple-200", 
        bgGradient: "from-violet-700 via-fuchsia-900 to-black", border: "border-purple-400/50",
        shortLine: "The Leviathan", 
        longStory: `A true force of nature. With ${totalTx} transactions across ${activeDays} days, you helped define the tides.` 
      };
  }
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = SEASON_END_DATE.getTime() - new Date().getTime();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 text-[10px] font-mono text-blue-300 bg-blue-900/20 border border-blue-500/30 px-3 py-1.5 rounded-full animate-pulse">
      <span className="uppercase tracking-widest text-slate-400">Season Ends:</span>
      <span className="font-bold text-white">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}

function TiltCard({ children, tier }: { children: React.ReactNode, tier: SuiTierInfo }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div 
      className="card-perspective relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`absolute top-10 left-0 right-0 h-full bg-gradient-to-b ${tier.bgGradient} blur-[60px] opacity-40 group-hover:opacity-60 transition duration-700`} />
      <div 
        ref={cardRef}
        className={`card-inner relative w-[320px] h-[480px] rounded-[32px] overflow-hidden bg-[#080c14] border-2 ${tier.border} shadow-2xl flex flex-col justify-between`}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)",
          boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.7)"
        }}
      >
        <div 
          className="card-glare absolute inset-0 z-20 transition-opacity duration-300"
          style={{ '--mx': `${glare.x}%`, '--my': `${glare.y}%`, opacity: glare.opacity } as React.CSSProperties}
        />
        <div className="relative h-full w-full flex flex-col justify-between z-10">
            {children}
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

  const [summary, setSummary] = useState<SuiYearlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
            const interval: any = setInterval(function() {
              const timeLeft = animationEnd - Date.now();
              if (timeLeft <= 0) return clearInterval(interval);
              const particleCount = 50 * (timeLeft / duration);
              confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
              confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setErrorMsg("Could not fetch data. Please refresh.");
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
        <div className="text-xl font-medium tracking-[0.3em] uppercase animate-pulse text-blue-300">
          Generating Card...
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-white/10 border-t-blue-500 animate-spin" />
      </main>
    );
  }

  if (errorMsg || !summary) {
    return (
      <main className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{errorMsg}</p>
          <Link href="/" className="px-6 py-2 bg-white text-black rounded-full font-bold">Try Again</Link>
        </div>
      </main>
    );
  }

  const tier = getSuiTier(summary.totalTxCount, summary.activeDays);
  const avatarUrl = twitterPfpUrl || "/bucket-default-pfp.png"; 
  const displayHandle = twitterHandle ? `@${twitterHandle}` : shortAddress;
  const apScore = calculatePower(summary.totalTxCount, summary.activeDays);

  const CardContent = ({ isHidden = false }) => (
    <>
        <div className="w-full flex justify-between items-center border-b border-white/5 px-6 pt-6 pb-3 shrink-0">
            <div className="flex items-center gap-2 opacity-95">
                <img src="/bucket-default-pfp.png" className="w-5 h-5" alt="Bucket Logo" />
                <span className="text-lg font-bold tracking-tight text-white font-sans">Bucket</span>
            </div>
            
            {/* ✨ AP Badge (With Hover Tooltip) */}
            {/* group: 當滑鼠移動到這個 div 時，觸發內部 group-hover */}
            <div className="group relative cursor-help px-2 py-1 rounded border border-cyan-500/20 bg-cyan-900/10 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <span className="text-[7px] text-cyan-400 uppercase tracking-wider font-bold">AP</span>
                <span className="text-[10px] font-mono font-bold text-cyan-100">{apScore}</span>

                {/* 🔥 The Marketing Tooltip 🔥 */}
                {/* 只有在非下載模式 (isHidden=false) 才顯示，避免下載時被意外截圖 */}
                {!isHidden && (
                    <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-xl bg-black/90 border border-white/10 backdrop-blur-md shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 text-left">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">
                            Attack Power Analysis
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-300">Consistency</span>
                                <span className="text-[9px] font-mono text-cyan-300">Days × 10</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-300">Impact</span>
                                <span className="text-[9px] font-mono text-cyan-300">+ Total TXs</span>
                            </div>
                            <div className="text-[8px] text-slate-500 italic mt-1 pt-1 border-t border-white/5">
                                Prove your on-chain dominance.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full px-5 min-h-0 my-1">
            <div className="relative shrink-0 mb-2">
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-110" />
                <div className={`relative w-36 h-36 rounded-full p-1 bg-gradient-to-b ${tier.bgGradient} border-[3px] border-white/20 shadow-2xl overflow-hidden`}>
                    <img 
                        src={avatarUrl} 
                        className={`w-full h-full rounded-full object-cover bg-[#0a0f1c] scale-105 ${isHidden ? '' : 'bucket-filter'}`} 
                        crossOrigin="anonymous" 
                        alt="pfp" 
                    />
                    {isHidden ? (
                        <div className="absolute inset-0 bg-cyan-500/30 rounded-full pointer-events-none" style={{ mixBlendMode: 'normal' }}></div>
                    ) : (
                        <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay rounded-full pointer-events-none"></div>
                    )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full flex justify-center">
                      <div className="bg-[#050a12] border border-white/20 px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${tier.color}`}></span>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] text-white`}>
                            {tier.name}
                        </span>
                      </div>
                </div>
            </div>
            <div className="text-center w-full mt-5">
                <h2 className="text-2xl font-bold text-white tracking-tighter truncate leading-tight drop-shadow-md px-2">{displayHandle}</h2>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-[0.25em] font-medium">{tier.shortLine}</p>
                <div className="mt-3 px-1"><p className="text-[10px] leading-4 text-slate-300 font-light italic opacity-80 line-clamp-3">"{tier.longStory}"</p></div>
            </div>
        </div>
        <div className="w-full grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 py-4 shrink-0 bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-0.5"><span className="text-xl font-medium text-white font-mono">{summary.totalTxCount}</span><span className="text-[7px] text-slate-500 uppercase tracking-[0.25em]">Transactions</span></div>
            <div className="flex flex-col items-center gap-0.5"><span className="text-xl font-medium text-white font-mono">{summary.activeDays}</span><span className="text-[7px] text-slate-500 uppercase tracking-[0.25em]">Active Days</span></div>
        </div>
    </>
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
            <div className="flex flex-col items-center gap-8 w-full max-w-[400px]">
                
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Your 2025 Legacy</h1>
                    <CountdownTimer />
                </div>

                <div className="animate-float">
                    <TiltCard tier={tier}>
                        <CardContent />
                    </TiltCard>
                </div>

                {/* Hidden Downloader */}
                <div className="absolute top-0 left-[-9999px]">
                    <div 
                        id="share-card-export"
                        className="relative w-[340px] h-[520px] bg-[#080c14] rounded-[32px] border border-white/20 p-0 flex flex-col justify-between text-center overflow-hidden"
                        style={{ backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)" }}
                    >
                        <CardContent isHidden={true} />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <TweetButton twitterHandle={twitterHandle} tier={tier.name} txCount={summary.totalTxCount} />
                        <ShareImageButton twitterHandle={twitterHandle} shortAddress={shortAddress} summary={summary} twitterPfpUrl={avatarUrl} />
                    </div>
                    
                    <a 
                        href="https://x.com/intent/user?screen_name=bucket_protocol" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition border border-blue-500/30 rounded-xl px-4 py-3 bg-blue-500/5 hover:bg-blue-500/10 w-full"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Follow @bucket_protocol 
                    </a>

                    <Link href="/" className="text-center text-xs text-slate-500 hover:text-white transition mt-2">
                        ← Check another address
                    </Link>
                </div>
            </div>
        </div>

        {/* Right Column (Scrollable) */}
        <div className="lg:col-span-7 bg-black/20">
            <div className="py-12 px-6 lg:px-12">
                <SocialFeed />
            </div>
        </div>

      </div>
    </main>
  );
}