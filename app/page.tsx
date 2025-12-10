"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// 🕒 設定活動結束時間
const SEASON_END_DATE = new Date("2026-01-07T23:59:59");

// 預覽用的 3D 卡片組件
function MockTiltCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="card-perspective relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 背景光暈 */}
      <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
      
      <div 
        ref={cardRef}
        className="card-inner relative w-[280px] h-[420px] rounded-[24px] overflow-hidden bg-[#080c14] border border-white/20 shadow-2xl"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)",
        }}
      >
        <div className="card-glare absolute inset-0 z-20" />
        
        {/* Mock Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-5">
            <div className="flex justify-between items-center opacity-70">
                <div className="flex items-center gap-1.5">
                    <img src="/bucket-default-pfp.png" className="w-3.5 h-3.5" alt="Logo" />
                    <span className="text-[9px] font-bold tracking-tight text-white font-sans">Bucket</span>
                </div>
                <div className="px-1.5 py-0.5 border border-white/10 rounded text-[7px] text-white/50">2025</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-b from-blue-400 to-purple-600 border-2 border-white/20">
                    <img src="/bucket-default-pfp.png" className="w-full h-full rounded-full bg-black object-cover bucket-filter" alt="Mock" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white">Your Name</h3>
                    <div className="inline-block bg-[#050a12] border border-white/20 px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-[0.2em] text-blue-300 mt-2">
                        CURRENT
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-3 bg-black/20 rounded-b-xl">
                <div className="text-center">
                    <div className="text-lg font-mono text-white">888</div>
                    <div className="text-[6px] text-slate-500 uppercase tracking-widest">TXs</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-mono text-white">365</div>
                    <div className="text-[6px] text-slate-500 uppercase tracking-widest">Days</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
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
    <div className="flex items-center gap-3 text-xs font-mono text-blue-300 bg-blue-900/20 border border-blue-500/30 px-4 py-2 rounded-full animate-pulse">
      <span className="uppercase tracking-widest text-slate-400">Season Ends:</span>
      <span className="font-bold text-white">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}

export default function Home() {
  const [address, setAddress] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session as any;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    router.push(`/wrapped/${address}?year=2025`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020408]">
      
      {/* ✨ 新增：右上角的 Open Bucket App 按鈕 */}
      <a
        href="https://www.bucketprotocol.io/earn"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full text-xs font-bold text-white transition-all hover:scale-105 backdrop-blur-sm group"
      >
        <span>Open Bucket App</span>
        <svg className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Content & Inputs */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8 order-2 lg:order-1">
            <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-3 opacity-90">
                    <img src="/bucket-default-pfp.png" className="w-8 h-8" alt="Bucket Logo" />
                    <span className="text-2xl font-bold tracking-tight text-white font-sans">Bucket</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-tight">
                    2025 <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Wrapped</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-md">
                    Visualize your 2025 Sui journey. <br/>Generate your legacy card now.
                </p>
                <div className="flex justify-center lg:justify-start">
                    <CountdownTimer />
                </div>
            </div>

            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-12">
                    {!user ? (
                        <button
                            onClick={() => signIn("twitter")}
                            className="w-full h-full flex items-center justify-center gap-3 bg-[#0f1419] hover:bg-[#1a202c] border border-white/10 hover:border-white/30 rounded-xl transition-all"
                        >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                            <span className="font-bold text-white text-sm">Connect X</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => signOut()}
                            className="w-full h-full flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3"
                        >
                            <img 
                                src={user.twitterPfpUrl?.replace('_normal', '') || "/bucket-default-pfp.png"} 
                                className="w-5 h-5 rounded-full border border-white/20" 
                            />
                            <span className="font-bold text-blue-200 truncate text-sm">@{user.twitterHandle}</span>
                        </button>
                    )}
                </div>

                <form onSubmit={handleCheck} className="h-12 flex gap-2">
                    <input
                        type="text"
                        placeholder="Sui Address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition font-mono text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!address}
                        className="px-5 bg-white text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition disabled:opacity-50 text-sm"
                    >
                        GO
                    </button>
                </form>
            </div>
        </div>

        {/* Right: Card Preview (Floating) */}
        <div className="flex justify-center items-center order-1 lg:order-2 animate-float">
            <MockTiltCard />
        </div>

      </div>
    </main>
  );
}

