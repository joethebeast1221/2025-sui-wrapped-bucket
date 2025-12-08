/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { BucketYearlySummary } from "@/lib/types";
import { ShareImageButton } from "@/components/ShareImageButton";
import { CopyShareButton } from "@/components/CopyShareButton";

// ---- Tier logic ----

type SuiTierId = "ripple" | "stream" | "current" | "tidal";

interface SuiTierInfo {
  id: SuiTierId;
  name: string;
  shortLine: string;
  longStory: string;
}

function getSuiTier(options: {
  totalTx: number;
  activeDays: number;
  usdBalanceEstimate?: number;
}): SuiTierInfo {
  const { totalTx, activeDays } = options;

  let id: SuiTierId;

  if (totalTx >= 400 || activeDays >= 80) {
    id = "tidal";
  } else if (totalTx >= 120 || activeDays >= 25) {
    id = "current";
  } else if (totalTx >= 20 || activeDays >= 5) {
    id = "stream";
  } else {
    id = "ripple";
  }

  switch (id) {
    case "ripple":
      return {
        id,
        name: "RIPPLE VISITOR",
        shortLine: "You left a light but real trace on Sui.",
        longStory:
          "You made a few ripples on Sui this year — enough to say you were here, watching the waves form.",
      };
    case "stream":
      return {
        id,
        name: "STREAM EXPLORER",
        shortLine: "You followed Sui’s streams with curiosity.",
        longStory:
          "You didn’t just dip your toes — you followed Sui’s streams across the year, exploring protocols and flows along the way.",
      };
    case "current":
      return {
        id,
        name: "CURRENT NATIVE",
        shortLine: "On Sui, you move with the current.",
        longStory:
          "You moved with Sui’s currents — protocols, mints, swaps, loops. On-chain is where you actually live.",
      };
    case "tidal":
    default:
      return {
        id: "tidal",
        name: "TIDAL FORCE",
        shortLine: "You helped shape Sui’s tides.",
        longStory:
          "You weren’t just in the Sui ecosystem — you were one of the forces shaping its tides. High frequency, high conviction.",
      };
  }
}

// ---- Page component ----

export default function WrappedPage() {
  const params = useParams<{ address: string }>();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const address = params.address;
  const year = Number(searchParams.get("year") ?? "2025") || 2025;

  const [summary, setSummary] = useState<BucketYearlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const anySession = session as any | null;
  const twitterHandle = anySession?.twitterHandle as string | undefined;
  const twitterPfpUrl = anySession?.twitterPfpUrl as string | undefined;

  const shortAddress =
    address && address.length > 14
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/wrapped?address=${encodeURIComponent(address)}&year=${year}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data?.error ||
              `Failed to load summary (status ${res.status}). Please try again.`
          );
        }
        const data = (await res.json()) as BucketYearlySummary;
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err: any) {
        console.error("Wrapped client error:", err);
        if (!cancelled) {
          setErrorMsg(
            err?.message ||
              "Failed to load Sui data. The RPC may be rate-limited or temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (address) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [address, year]);

  // --- Loading state ---
  if (loading && !summary && !errorMsg) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/25 border-t-white animate-spin" />
          <p className="text-sm text-slate-200">
            Stitching your Sui {year} activity into a Bucket card…
          </p>
        </div>
      </main>
    );
  }

  // --- Error state ---
  if (errorMsg && !summary) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-light">
            We couldn&apos;t load your Sui {year} Wrapped.
          </h1>
          <p className="text-sm text-slate-300">{errorMsg}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                // 簡單重新觸發 useEffect
                setSummary(null);
                setErrorMsg(null);
                setLoading(true);
              }}
              className="px-4 py-2 rounded-2xl bg-white text-black text-sm font-medium"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-2xl border border-white/30 text-sm text-slate-100"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- Ready state ---
  if (!summary) {
    // 保險：不該發生，但避免空白頁
    return null;
  }

  const hasActivity = summary.totalBucketTxCount > 0;
  const tier = getSuiTier({
    totalTx: summary.totalBucketTxCount,
    activeDays: summary.activeBucketDays,
  });

  const bgTopClass =
    tier.id === "ripple"
      ? "bg-[radial-gradient(circle_at_0%_0%,rgba(148,163,184,0.40),transparent_65%)]"
      : tier.id === "stream"
      ? "bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.75),transparent_65%)]"
      : tier.id === "current"
      ? "bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.85),transparent_65%)]"
      : "bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.95),transparent_65%)]";

  const bgBottomClass =
    tier.id === "ripple"
      ? "bg-[radial-gradient(circle_at_100%_100%,rgba(15,23,42,0.85),transparent_60%)]"
      : tier.id === "stream"
      ? "bg-[radial-gradient(circle_at_100%_100%,rgba(30,64,175,0.95),transparent_60%)]"
      : tier.id === "current"
      ? "bg-[radial-gradient(circle_at_100%_100%,rgba(15,118,110,0.95),transparent_60%)]"
      : "bg-[radial-gradient(circle_at_100%_100%,rgba(79,70,229,0.98),transparent_60%)]";

  const tierBaseClass =
    "inline-flex flex-col items-start gap-2 rounded-2xl px-4 py-3 border text-left";
  const tierStyleClass =
    tier.id === "ripple"
      ? "border-white/12 bg-white/5"
      : tier.id === "stream"
      ? "border-sky-300/70 bg-sky-500/5"
      : tier.id === "current"
      ? "border-sky-300 bg-sky-500/10 shadow-[0_0_40px_rgba(56,189,248,0.4)]"
      : "border-sky-200 bg-sky-500/15 shadow-[0_0_60px_rgba(56,189,248,0.75)]";

  const avatarUrl = twitterPfpUrl || "/bucket-default-pfp.png";
  const displayHandle = twitterHandle ? `@${twitterHandle}` : shortAddress;

  return (
    <main className="min-h-screen bg-black relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-black" />
      <div
        className={`pointer-events-none absolute -top-72 right-[-8rem] w-[60vw] h-[60vw] blur-[140px] ${bgTopClass}`}
      />
      <div
        className={`pointer-events-none absolute bottom-[-22rem] left-[-12rem] w-[55vw] h-[55vw] blur-[150px] ${bgBottomClass}`}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/15 blur-lg" />
              <img
                src="/bucket-default-pfp.png"
                alt="Bucket logo"
                className="relative w-8 h-8 rounded-full border border-white/30 shadow-[0_0_32px_rgba(148,163,184,0.9)]"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium tracking-[0.16em] uppercase text-white">
                Bucket
              </span>
              <span className="text-[10px] text-slate-200 tracking-[0.22em] uppercase">
                Sui {year} Wrapped
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-300 underline underline-offset-4 hover:text-white shrink-0"
          >
            ← Back to steps
          </Link>
        </header>

        <div className="text-[11px] text-slate-400 tracking-[0.18em] uppercase">
          Step 3 of 3 · Your Sui {year} Card
        </div>

        {/* Hero section */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 mt-2">
          {/* Left: Profile + tier */}
          <div className="flex flex-col items-center md:items-start gap-4 md:w-[32%]">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-[rgba(148,163,184,0.65)] rounded-full animate-pulse" />
              <div className="relative rounded-full p-[3px] bg-black border border-white/24 shadow-[0_0_60px_-18px_rgba(148,163,184,1)]">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
                />
              </div>
            </div>

            <div className="text-center md:text-left space-y-1">
              <p className="text-sm md:text-base text-white">{displayHandle}</p>
              <p className="text-[11px] text-slate-400 font-light">
                Address · <span className="font-mono">{shortAddress}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Year · <span>{summary.year}</span>
              </p>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/20 px-3 py-1.5 text-[11px] text-slate-100">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasActivity ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <span>
                {hasActivity
                  ? "On-chain Sui activity detected"
                  : "No Sui transactions found for this year"}
              </span>
            </div>

            <div className="mt-3">
              <div className={`${tierBaseClass} ${tierStyleClass}`}>
                <span className="text-[10px] tracking-[0.22em] uppercase text-slate-300">
                  Sui Presence Tier
                </span>
                <p className="text-sm font-semibold text-white">
                  {tier.name}
                </p>
                <p className="text-[11px] text-slate-200/90 max-w-xs">
                  {tier.shortLine}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-slate-500 max-w-xs">
              This recap reads all your public Sui transactions from this
              address in {year}. Wrapped experience by Bucket Protocol.
            </p>
          </div>

          {/* Right: Main story + share card preview */}
          <div className="md:w-[68%] space-y-5">
            {/* Narrative card */}
            <div className="rounded-[32px] bg-white/[0.02] border border-white/[0.09] backdrop-blur-xl shadow-[0_0_90px_-24px_rgba(15,23,42,0.9)] p-6 md:p-8 space-y-4 md:space-y-5 transition hover:border-white/24 hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[11px] tracking-[0.24em] uppercase text-slate-300">
                  Your Sui Story · {year}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.18em]">
                  Tier · {tier.name}
                </p>
              </div>

              <div className="space-y-3">
                <h1 className="text-[30px] md:text-[38px] font-light leading-tight text-white">
                  Every transaction left a trace.
                  <br className="hidden md:block" /> We just stitched it into a
                  story.
                </h1>
                <p className="text-sm md:text-base text-slate-200 font-light">
                  {tier.longStory}
                </p>
              </div>

              <p className="text-[13px] text-slate-400 font-light">
                Across all your on-chain activity on Sui in {year}, we counted{" "}
                <span className="font-mono text-slate-100">
                  {summary.totalBucketTxCount} transactions
                </span>{" "}
                distributed over{" "}
                <span className="font-mono text-slate-100">
                  {summary.activeBucketDays} active days
                </span>
                . Think of it as your Sui footprint for the year — now
                Bucket-branded.
              </p>

              {summary.personalityTags &&
                summary.personalityTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {summary.personalityTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/14 text-[11px] text-slate-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            {/* Share card (1:1, used by html-to-image) */}
            <div className="space-y-3">
              <p className="text-[11px] tracking-[0.24em] uppercase text-slate-300">
                Shareable Card
              </p>
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                <div className="md:flex-1">
                  <div
                    id="bucket-share-card"
                    style={{ aspectRatio: "1 / 1" }}
                    className="w-full max-w-sm bg-black border border-white/[0.18] rounded-[32px] p-6 md:p-8 text-center shadow-[0_0_90px_-20px_rgba(15,23,42,0.9)] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.45),transparent_65%)] flex flex-col items-center justify-center mx-auto"
                  >
                    <div className="relative mb-5">
                      <div className="absolute inset-0 blur-xl bg-[rgba(148,163,184,0.7)] rounded-full" />
                      <div className="relative rounded-full p-[3px] bg-black border border-white/30 shadow-[0_0_50px_rgba(148,163,184,1)]">
                        <img
                          src={avatarUrl}
                          alt="Preview avatar"
                          className="w-[72px] h-[72px] rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border border-white/40 flex items-center justify-center">
                          <img
                            src="/bucket-default-pfp.png"
                            alt="Bucket mini"
                            className="w-4 h-4 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] tracking-[0.26em] uppercase text-slate-400">
                      Sui {year} Wrapped
                    </p>

                    <h3 className="mt-2 text-xl font-light text-white">
                      {displayHandle}
                    </h3>

                    <div className="mt-3 text-[11px] text-slate-200 uppercase tracking-[0.18em]">
                      {tier.name}
                    </div>

                    <p className="mt-3 text-[11px] text-slate-300 px-4">
                      {tier.shortLine}
                    </p>

                    <div className="mt-4 space-y-1 text-slate-300 text-sm font-light">
                      <p>{summary.totalBucketTxCount} Sui transactions</p>
                      <p>{summary.activeBucketDays} active days on Sui</p>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                      <img
                        src="/bucket-default-pfp.png"
                        alt="Bucket logo"
                        className="w-7 h-7 rounded-full opacity-90"
                      />
                      <p className="text-[10px] text-slate-500 font-light">
                        Wrapped experience by Bucket · Built on Sui
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="md:w-48 flex md:flex-col gap-3 items-start md:items-stretch">
                  <ShareImageButton
                    twitterHandle={twitterHandle}
                    shortAddress={shortAddress}
                    summary={summary}
                    twitterPfpUrl={twitterPfpUrl}
                  />
                  <CopyShareButton address={address} year={year} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}



