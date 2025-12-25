"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";

interface CardFrontProps {
  displayHandle: string;
  score: number;
  rankTitle: string;
  rankDesc: string;
  avatarUrl: string;
  protocolCount: number;
  hideButton?: boolean; // 名人堂顯示時通常不需要翻轉按鈕
  onFlip?: () => void;
}

export function CardFront({
  displayHandle,
  score,
  rankTitle,
  rankDesc,
  avatarUrl,
  protocolCount,
  hideButton = false,
  onFlip,
}: CardFrontProps) {
  return (
    <div className="flex flex-col h-full font-sans relative w-full h-full bg-[#080c14]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="font-bold text-lg text-white truncate max-w-[180px] tracking-tight">
          {displayHandle}
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xl italic">
          <span className="text-[10px] not-italic font-normal text-cyan-300/60 mr-1 mt-0.5">
            SP
          </span>
          {score}
        </div>
      </div>

      {/* Character */}
      <div className="px-6 py-5 flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative aspect-square w-full max-w-[160px] md:max-w-[200px] rounded-2xl border-4 border-slate-700/50 overflow-hidden shadow-inner bg-gradient-to-b from-slate-800 to-black group">
          <img
            src={avatarUrl}
            className="w-full h-full object-cover bucket-filter group-hover:scale-105 transition-transform duration-700"
            crossOrigin="anonymous"
            alt="pfp"
          />
        </div>

        <div className="mt-4 text-center w-full">
          <h3 className="text-xl font-bold text-white mb-1">{rankTitle}</h3>
          <p className="text-[10px] text-slate-400 font-light italic opacity-80 line-clamp-1 px-2 min-h-[1.5em]">
            "{rankDesc}"
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 pb-6">
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white font-mono leading-none">
            {protocolCount} / 9
          </span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-2">
            Protocols Activated
          </span>
        </div>

        {/* Flip Button (Conditional) */}
        {!hideButton && onFlip && (
          <div
            className="mt-6 flex justify-center cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
          >
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 border border-white/20 shadow-lg shadow-blue-500/30 animate-pulse group-hover:scale-105 transition-transform">
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                View Footprint ↻
              </span>
            </div>
          </div>
        )}
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
}