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
import { calculateAdvancedAP, PROTOCOL_LIST } from "@/lib/mockData";

const SEASON_END_DATE = new Date("2026-01-07T23:59:59");

// 🔗 協議連結設定區 (請在此填入各協議的真實網址)
const PROTOCOL_URLS: Record<string, string> = {
  'NAVI': "https://app.naviprotocol.io/",
  'Suilend': "https://suilend.fi/?asset=USDB&lendingMarketId=0xd12df5fede59f1ac5e1f8413bc86bd6bc77fff2001366878df58ef6a26d58c67",
  'Bluefin': "https://trade.bluefin.io/deposit/0x15dbcac854b1fc68fc9467dbd9ab34270447aabd8cc0e04a5864d95ccb86b74a",
  'Lake': "https://www.lake.inc/vault",      // 請確認網址
  'Bucket': "https://www.bucketprotocol.io/earn/leverage?input=SUI&hodl=SUI",
  'Cetus': "https://app.cetus.zone/clmm?poolAddress=0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105",
  'Scallop': "https://app.scallop.io/",
  'Walrus': "https://stake-wal.wal.app/",
  'Deepbook': "https://deeptrade.io/trade/SUI_USDC", // 請確認網址
};

// ✨ 雙面翻轉卡片組件 (狀態由外部 isFlipped 控制)
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
      className="card-perspective relative group z-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
            {/* --- FRONT FACE --- */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 shadow-2xl flex flex-col"
                style={{ 
                    backfaceVisibility: "hidden",
                    // 關鍵修正：翻轉到背面時，禁用正面的滑鼠事件，避免擋住背面按鈕
                    pointerEvents: isFlipped ? "none" : "auto", 
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

            {/* --- BACK FACE --- */}
            <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 shadow-2xl flex flex-col"
                style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)",
                    // 關鍵修正：翻轉到背面時，才啟用背面的滑鼠事件
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
  const [activePlayersCount, setActivePlayersCount] = useState(0);
  
  // 控制翻轉狀態
  const [isFlipped, setIsFlipped] = useState(false);
  
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
  
  const myProtocols = summary.interactedProtocols || []; 
  
  // 計算分數 (使用地址作為隨機種子)
  const result = calculateAdvancedAP(myProtocols.length, address);

  // --- 卡片正面 ---
  const CardFront = () => {
    return (
        <div className="flex flex-col h-full font-sans relative">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="font-bold text-lg text-white truncate max-w-[180px] tracking-tight">{displayHandle}</div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xl italic">
                    <span className="text-[10px] not-italic font-normal text-cyan-300/60 mr-1 mt-0.5">SP</span>
                    {result.score}
                </div>
            </div>

            {/* Character */}
            <div className="px-6 py-5 flex-1 flex flex-col items-center justify-center min-h-0">
                <div className="relative aspect-square w-full max-w-[200px] rounded-2xl border-4 border-slate-700/50 overflow-hidden shadow-inner bg-gradient-to-b from-slate-800 to-black group">
                    <img src={avatarUrl} className="w-full h-full object-cover bucket-filter group-hover:scale-105 transition-transform duration-700" crossOrigin="anonymous" alt="pfp" />
                </div>
                
                <div className="mt-4 text-center w-full">
                    <h3 className="text-xl font-bold text-white mb-1">{result.rankTitle}</h3>
                    <p className="text-[10px] text-slate-400 font-light italic opacity-80 line-clamp-1 px-2">
                        "{result.rankDesc}"
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-6 pb-6">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white font-mono leading-none">{myProtocols.length} / 9</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-2">Protocols Activated</span>
                </div>

                {/* Flip Button (Front -> Back) */}
                <div 
                    className="mt-6 flex justify-center cursor-pointer group"
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                >
                    <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 border border-white/20 shadow-lg shadow-blue-500/30 animate-pulse group-hover:scale-105 transition-transform">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">View Footprint ↻</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <div className="px-4 py-2 bg-black/60 text-[9px] text-slate-500 text-center uppercase tracking-[0.2em] flex justify-between border-t border-white/5 backdrop-blur-sm">
                    <span>Bucket Protocol</span>
                    <span>2025 Edition</span>
                </div>
            </div>
        </div>
    );
  };

  // --- 卡片背面 ---
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

        {/* 3x3 Logo Grid */}
        <div className="grid grid-cols-3 gap-4 flex-1 content-start">
            {PROTOCOL_LIST.map((p, index) => {
                const isActive = myProtocols.includes(p);
                const isCenter = index === 4;
                const url = PROTOCOL_URLS[p] || "#"; // 取得網址

                return (
                    <Link
                        key={p} 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        onClick={(e) => e.stopPropagation()} // 防止點擊圖示時翻轉
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
                                w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-1 shadow-inner
                                ${isCenter ? 'bg-white text-blue-600' : (isActive ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' : 'bg-slate-800 text-slate-500')}
                            `}>
                                {p[0]}
                            </div>
                            <span className={`text-[8px] uppercase tracking-wider font-bold ${isCenter ? 'text-white' : 'text-slate-300'}`}>
                                {p}
                            </span>
                        </div>
                    </Link>
                )
            })}
        </div>

        {/* Flip Button (Back -> Front) */}
        <div className="mt-auto pt-6 border-t border-white/10 flex justify-center">
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
      
      {/* Background Mesh */}
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

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-[60vh] gap-12 lg:gap-24 px-6 pb-12 pt-8">
        
        {/* Left Content */}
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
                <div className="w-full sm:w-auto min-w-[140px] [&>button]:!bg-blue-50 [&>button]:!text-blue-600 [&>button]:dark:!bg-blue-500/20 [&>button]:dark:!text-blue-200 [&>button]:!rounded-full [&>button]:!py-3 [&>button]:!border-0 [&>button]:!shadow-none [&>button]:hover:!scale-105">
                    <ShareImageButton twitterHandle={twitterHandle} shortAddress={shortAddress} summary={summary} twitterPfpUrl={avatarUrl} />
                </div>
                <div className="w-full sm:w-auto min-w-[140px] [&>button]:!bg-blue-600 [&>button]:!text-white [&>button]:!rounded-full [&>button]:!py-3 [&>button]:!border-0 [&>button]:!shadow-xl [&>button]:hover:!scale-105">
                    <TweetButton twitterHandle={twitterHandle} tier={result.rankTitle} txCount={myProtocols.length * 10} />
                </div>
            </div>

            <div className="w-full mt-4">
                <QuestActions />
            </div>
        </div>

        {/* Right Content - The Card */}
        <div className="flex justify-center animate-float">
            <div className="absolute top-0 left-[-9999px]">
                <div 
                    id="share-card-export"
                    className="relative w-[360px] h-[540px] rounded-[32px] overflow-hidden bg-[#080c14] border border-white/10 p-0"
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
                isFlipped={isFlipped}
            />
        </div>

      </div>

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