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
import { calculateAdvancedAP, PROTOCOL_LIST } from "@/lib/mockData";
import { CardFront } from "@/components/CardFront"; 

// 🔗 協議連結
const PROTOCOL_URLS: Record<string, string> = {
  'NAVI': "https://app.naviprotocol.io/",
  'Suilend': "https://suilend.fi/",
  'Bluefin': "https://bluefin.io/",
  'Lake': "https://lake.finance/",
  'Bucket': "https://app.bucketprotocol.io/",
  'Cetus': "https://www.cetus.zone/",
  'Scallop': "https://scallop.io/",
  'Walrus': "https://www.walrus.xyz/",
  'Deepbook': "https://sui.io/deepbook",
};

// 🖼️ 協議 Logo
const PROTOCOL_LOGOS: Record<string, string> = {
  'NAVI': "/logos/navi.png",
  'Suilend': "/logos/suilend.png",
  'Bluefin': "/logos/bluefin.png",
  'Lake': "/logos/lake.png",
  'Bucket': "/logos/bucket.png",
  'Cetus': "/logos/cetus.png",
  'Scallop': "/logos/scallop.png",
  'Walrus': "/logos/walrus.png",
  'Deepbook': "/logos/deepbook.png",
};

function TiltFlipCard({ 
    front, 
    back, 
    isFlipped 
}: { 
    front: React.ReactNode, 
    back: React.ReactNode, 
    isFlipped: boolean 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // ✨ 優化：手機版不觸發 Tilt (傾斜) 效果，避免滑動頁面時卡片亂動
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    // 簡單判斷：如果是觸控裝置或螢幕很小，就不做 3D 傾斜運算
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

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
      className="card-perspective relative group z-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute top-10 left-4 right-4 h-full bg-blue-500/20 blur-[60px] -z-10 rounded-full" />
      
      <div 
        ref={cardRef}
        // ✨ RWD 關鍵：寬度改為 w-[90vw] max-w-[360px]，讓手機版自動縮小
        className="card-inner relative w-[90vw] max-w-[360px] aspect-[2/3] rounded-[32px] transition-transform duration-100 ease-out mx-auto"
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
            {/* Front */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 shadow-2xl flex flex-col"
                style={{ 
                    backfaceVisibility: "hidden",
                    pointerEvents: isFlipped ? "none" : "auto", 
                }}
            >
                <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]" />
                <div className="card-glare absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-60" />
                <div className="relative z-10 h-full flex flex-col">
                    {front}
                </div>
            </div>

            {/* Back */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 shadow-2xl flex flex-col"
                style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)",
                    pointerEvents: isFlipped ? "auto" : "none",
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  
  const anySession = session as any | null;
  const twitterHandle = anySession?.twitterHandle as string | undefined;
  const twitterPfpUrl = anySession?.twitterPfpUrl?.replace('_normal', '') as string | undefined;
  const avatarUrl = twitterPfpUrl || "/bucket-default-pfp.png"; 

  const shortAddress = address && address.length > 14 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  const displayHandle = twitterHandle ? `@${twitterHandle}` : (suiNsName || shortAddress);
  
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (session === undefined) return; 

      setLoading(true);
      try {
        let apiUrl = `/api/wrapped?address=${encodeURIComponent(address)}&year=${year}`;
        if (twitterHandle) apiUrl += `&handle=${encodeURIComponent(twitterHandle)}`;
        if (twitterPfpUrl) apiUrl += `&avatar=${encodeURIComponent(twitterPfpUrl)}`;

        const res = await fetch(apiUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load data.");
        const data = (await res.json()) as SuiYearlySummary;
        
        if (!cancelled) {
            setSummary(data);
            // 延遲一點撒花，確保畫面已渲染
            setTimeout(() => {
                const duration = 3 * 1000;
                const end = Date.now() + duration;
                const interval: any = setInterval(() => {
                    if (Date.now() > end) return clearInterval(interval);
                    confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, particleCount: 50, origin: { x: Math.random(), y: Math.random() - 0.2 } });
                }, 250);
            }, 500);
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
  }, [address, year, twitterHandle, twitterPfpUrl, session === undefined]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white gap-6">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <div className="text-xl font-medium tracking-[0.2em] uppercase animate-pulse text-blue-300">Generating Card...</div>
      </main>
    );
  }

  if (errorMsg || !summary) return <div className="text-white p-10 text-center">{errorMsg}</div>;

  const myProtocols = summary.interactedProtocols || []; 
  const result = calculateAdvancedAP(myProtocols.length, address);

  const CardBack = () => (
    <div className="h-full flex flex-col p-6 font-sans bg-[#080c14]">
        <div className="w-full flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-white tracking-wider">Footprint</span>
                <span className="text-[10px] text-slate-400">Protocols Activated</span>
            </div>
            <span className="text-sm font-mono text-cyan-300 bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                {myProtocols.length}/9
            </span>
        </div>

        <div className="grid grid-cols-3 gap-3 flex-1 content-start">
            {PROTOCOL_LIST.map((p, index) => {
                const isActive = myProtocols.includes(p);
                const isCenter = index === 4;
                const url = PROTOCOL_URLS[p] || "#"; 
                const logoPath = PROTOCOL_LOGOS[p];

                return (
                    <Link
                        key={p} 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div 
                            className={`
                                aspect-square rounded-xl flex flex-col items-center justify-center border transition-all duration-300 relative overflow-hidden cursor-pointer
                                ${isActive 
                                    ? (isCenter 
                                        ? 'bg-blue-600 border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.6)] z-10 scale-105' 
                                        : 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/20 hover:scale-105')
                                    : 'bg-black/40 border-white/5 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center mb-1 overflow-hidden
                                ${isCenter ? 'bg-white' : (isActive ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-slate-800')}
                            `}>
                                {logoPath && !imgError[p] ? (
                                    <img 
                                        src={logoPath} 
                                        alt={p} 
                                        className="w-full h-full object-cover" 
                                        onError={() => setImgError(prev => ({ ...prev, [p]: true }))}
                                    />
                                ) : (
                                    <span className={`text-[10px] sm:text-xs font-bold ${isCenter ? 'text-blue-600' : (isActive ? 'text-white' : 'text-slate-500')}`}>
                                        {p[0]}
                                    </span>
                                )}
                            </div>
                            
                            <span className={`text-[7px] sm:text-[8px] uppercase tracking-wider font-bold ${isCenter ? 'text-white' : 'text-slate-300'}`}>
                                {p}
                            </span>
                        </div>
                    </Link>
                )
            })}
        </div>

        <div className="mt-auto pt-4 sm:pt-6 border-t border-white/10 flex justify-center">
            <div 
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            >
                <span className="text-xs font-bold text-white uppercase tracking-widest">View Card ↻</span>
            </div>
        </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-[#020408] font-sans relative overflow-x-hidden transition-colors">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-pink-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <img src="/bucket-default-pfp.png" className="w-6 h-6" alt="Logo" />
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Bucket</span>
        </div>
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition px-4 py-2">
            START OVER
        </Link>
      </nav>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-[60vh] gap-8 lg:gap-24 px-6 pb-12 pt-4 lg:pt-8">
        
        {/* Left Content (Text & Buttons) */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 lg:gap-8 max-w-lg order-2 lg:order-1">
            <div>
                {/* ✨ 優化字體大小：手機 text-4xl，電腦 text-7xl */}
                <h1 className="text-4xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-4">
                    Your Bucket <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Top Signal</span> Card
                </h1>
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-normal">
                    Generated from your on-chain activity in 2025.
                </p>
            </div>

            {/* ✨ 優化按鈕佈局：手機版垂直堆疊 (w-full)，電腦版水平排列 */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full">
                <div className="w-full sm:w-auto min-w-[140px] [&>button]:!w-full [&>button]:!bg-blue-50 [&>button]:!text-blue-600 [&>button]:dark:!bg-blue-500/20 [&>button]:dark:!text-blue-200 [&>button]:!rounded-full [&>button]:!py-3 [&>button]:!border-0 [&>button]:!shadow-none [&>button]:hover:!scale-105">
                    <ShareImageButton twitterHandle={twitterHandle} shortAddress={shortAddress} summary={summary} twitterPfpUrl={avatarUrl} />
                </div>
                <div className="w-full sm:w-auto min-w-[140px] [&>a]:!w-full [&>a]:!bg-black [&>a]:!text-white [&>a]:!rounded-full [&>a]:!py-3 [&>a]:!border-0 [&>a]:!shadow-xl [&>a]:hover:!scale-105">
                    <TweetButton twitterHandle={twitterHandle} tier={result.rankTitle} protocolCount={myProtocols.length} />
                </div>
            </div>
        </div>

        {/* Right Content - The Card */}
        {/* ✨ 優化：Order-1 讓卡片在手機版顯示在最上面，電腦版顯示在右邊 */}
        <div className="flex justify-center animate-float order-1 lg:order-2 w-full lg:w-auto">
            
            {/* 隱藏的 Export 專用卡片 (保持 360px 寬度以確保圖片生成品質) */}
            <div className="absolute top-0 left-[-9999px]">
                <div 
                    id="share-card-export"
                    className="relative w-[360px] h-[540px] rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 p-0"
                >
                     <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]" />
                    <div className="relative z-10 h-full flex flex-col">
                        <CardFront 
                            displayHandle={displayHandle}
                            score={result.score}
                            rankTitle={result.rankTitle}
                            rankDesc={result.rankDesc}
                            avatarUrl={avatarUrl}
                            protocolCount={myProtocols.length}
                            hideButton={true}
                        />
                    </div>
                </div>
            </div>

            {/* 顯示的互動卡片 */}
            <TiltFlipCard 
                front={
                    <CardFront 
                        displayHandle={displayHandle}
                        score={result.score}
                        rankTitle={result.rankTitle}
                        rankDesc={result.rankDesc}
                        avatarUrl={avatarUrl}
                        protocolCount={myProtocols.length}
                        hideButton={false}
                        onFlip={() => setIsFlipped(true)}
                    />
                } 
                back={<CardBack />} 
                isFlipped={isFlipped}
            />
        </div>

      </div>

      <div className="relative z-10 w-full border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center gap-2">
            <SocialFeed />
        </div>
      </div>
    </main>
  );
}