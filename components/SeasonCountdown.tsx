"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function computeRemaining(target: Date): Remaining {
  const now = Date.now();
  const diff = target.getTime() - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    finished: false,
  };
}

export function SeasonCountdown({
  targetIso,
  label = "Season ends in",
}: {
  targetIso: string; // e.g. "2026-01-15T00:00:00Z"
  label?: string;
}) {
  // ❗ SSR 階段完全不計算時間，只存 null
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [ready, setReady] = useState(false); // 用來辨識「client 已經跑過一次」

  useEffect(() => {
    const target = new Date(targetIso);

    const update = () => {
      const next = computeRemaining(target);
      setRemaining(next);
      setReady(true);
    };

    update(); // mount 時先算一次
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [targetIso]);

  const finished = ready && remaining ? remaining.finished : false;

  let text = "--d:--h:--m:--s";
  if (ready && remaining) {
    const dd = remaining.days.toString().padStart(2, "0");
    const hh = remaining.hours.toString().padStart(2, "0");
    const mm = remaining.minutes.toString().padStart(2, "0");
    const ss = remaining.seconds.toString().padStart(2, "0");
    text = `${dd}d:${hh}h:${mm}m:${ss}s`;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-3 py-1.5 text-[11px] text-slate-100">
      <span className="uppercase tracking-[0.22em] text-slate-400">
        {finished ? "Season ended" : label}
      </span>

      {!finished && (
        <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
          {text}
        </span>
      )}
    </div>
  );
}
