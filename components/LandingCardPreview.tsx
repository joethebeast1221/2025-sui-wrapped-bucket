"use client";

import React, { useRef, useState, MouseEvent } from "react";

export function LandingCardPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // 3D 傾斜效果邏輯
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 計算旋轉角度，數值越大傾斜越明顯
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    // 滑鼠離開時復原
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="card-perspective relative w-[320px] h-[500px] hidden lg:block cursor-wait"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 背後的光暈 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/30 blur-[100px] -z-10 rounded-full" />

      <div 
        ref={cardRef}
        className="w-full h-full rounded-[32px] overflow-hidden bg-[#080c14] border-2 border-white/10 shadow-2xl transition-transform duration-100 ease-out relative"
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
          backgroundImage: "linear-gradient(160deg, #1e293b 0%, #020408 60%)"
        }}
      >
        {/* 卡片表面反光 */}
        <div className="card-glare absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-40 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.4)_30%,rgba(255,255,255,0)_60%)]" />

        {/* --- 卡片內容 (Mock Data) --- */}
        <div className="relative h-full flex flex-col justify-between z-10 p-1">
            {/* Top */}
            <div className="w-full flex justify-between items-center px-6 pt-6 pb-2 shrink-0 opacity-50">
                <div className="flex items-center gap-2">
                    <img src="/bucket-default-pfp.png" className="w-6 h-6 grayscale" alt="Bucket Logo" />
                    <span className="text-xl font-bold tracking-tight text-white font-sans">Bucket</span>
                </div>
                <div className="px-3 py-1 rounded border border-white/10 bg-white/5 flex items-center gap-1.5">
                    <span className="text-[8px] uppercase tracking-wider font-bold">SP Score</span>
                    <span className="text-xs font-mono font-bold text-white">????</span>
                </div>
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-6 -mt-4">
                <div className="relative mb-6 group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-110 group-hover:bg-blue-500/40 transition-all" />
                    <div className={`relative w-32 h-32 rounded-full p-1 bg-gradient-to-b from-slate-700 to-slate-900 border-[3px] border-white/10 overflow-hidden shadow-2xl`}>
                        <img src="/bucket-default-pfp.png" className="w-full h-full rounded-full object-cover opacity-50" alt="pfp" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl">🔒</span>
                        </div>
                    </div>
                </div>
                <div className="text-center w-full space-y-3 animate-pulse">
                    <div className="h-8 bg-white/10 rounded-lg w-3/4 mx-auto" />
                    <div className="h-16 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 rounded-xl w-full mx-auto flex items-center justify-center">
                         <span className="text-xl font-bold text-yellow-500/50">Create to Reveal</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full grid grid-cols-2 divide-x divide-white/5 border-t border-white/5 py-5 shrink-0 bg-black/20 text-slate-500 opacity-50">
                <div className="flex flex-col items-center gap-1"><span className="text-2xl font-medium font-mono">---</span><span className="text-[8px] uppercase tracking-[0.25em]">Transactions</span></div>
                <div className="flex flex-col items-center gap-1"><span className="text-2xl font-medium font-mono">---</span><span className="text-[8px] uppercase tracking-[0.25em]">Active Days</span></div>
            </div>
        </div>
        
        {/* 浮水印 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
            <span className="text-6xl font-bold uppercase tracking-widest -rotate-45 text-white">Preview</span>
        </div>
      </div>
    </div>
  );
}