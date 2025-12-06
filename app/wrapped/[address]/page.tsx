/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildBucketYearlySummary } from "@/lib/suiBucketAnalytics";
import type { BucketYearlySummary } from "@/lib/types";
import { CopyShareButton } from "@/components/CopyShareButton";
import { ShareImageButton } from "@/components/ShareImageButton";

/* ---------- Props 型別 ---------- */

interface WrappedPageProps {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ year?: string }>;
}

/* ---------- 主頁面 ---------- */

export default async function WrappedPage(props: WrappedPageProps) {
  const { address } = await props.params;
  const { year: rawYear } = await props.searchParams;
  const year = Number(rawYear ?? "2025") || 2025;

  const [summary, session] = await Promise.all([
    // 現在 buildBucketYearlySummary 統計的是「此地址在 Sui 的所有 tx」
    buildBucketYearlySummary(address, year),
    getServerSession(authOptions),
  ]);

  const shortAddress =
    address.length > 14
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  const anySession = session as any | null;
  const twitterHandle = anySession?.twitterHandle as string | undefined;
  const twitterPfpUrl = anySession?.twitterPfpUrl as string | undefined;

  const hasActivity = summary.totalBucketTxCount > 0;
  const maxTx = Math.max(
    ...summary.activityTimeline.map((x) => x.txCount || 0),
    1,
  );

  // 🔹 Sui 使用者分級（依 totalTx + activeDays）
  const tier = getSuiTier({
    totalTx: summary.totalBucketTxCount,
    activeDays: summary.activeBucketDays,
  });

  // 🔹 不同 tier 對應不同背景光暈
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

  return (
    <main className="min-h-screen bg-black relative overflow-hidden text-white">
      {/* 背景光暈（依 tier 改變色調與強度） */}
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
              <span className="text-xs	font-medium tracking-[0.16em] uppercase text-white">
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
            ← Start a new recap
          </Link>
        </header>

        {/* Hero section */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 mt-2">
          {/* 左側：大頭貼 + 基本資訊 + Tier */}
          <div className="flex flex-col items-center md:items-start gap-4 md:w-[32%]">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-[rgba(148,163,184,0.65)] rounded-full animate-pulse" />
              <div className="relative rounded-full p-[3px] bg-black border border-white/24 shadow-[0_0_60px_-18px_rgba(148,163,184,1)]">
                <img
                  src={twitterPfpUrl || "/bucket-default-pfp.png"}
                  alt="Profile"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
                />
              </div>
            </div>

            <div className="text-center md:text-left space-y-1">
              <p className="text-sm md:text-base text-white">
                {twitterHandle ? `@${twitterHandle}` : shortAddress}
              </p>
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

            {/* 分級卡片 */}
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

          {/* 右側：主敘事卡（依 tier 故事切換） */}
          <div className="md:w-[68%]">
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

                {/* 依 tier.longStory 改變敘事 */}
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

              {summary.personalityTags.length > 0 && (
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

              {/* 三句 recap */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400">
                <div className="rounded-2xl border border-white/8 bg-white/[0.01] px-3 py-3">
                  <p className="uppercase tracking-[0.22em] text-slate-500 mb-1">
                    You showed up
                  </p>
                  <p>
                    From swaps to contract calls, every interaction was etched
                    into Sui&apos;s ledger.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.01] px-3 py-3">
                  <p className="uppercase tracking-[0.22em] text-slate-500 mb-1">
                    You moved value
                  </p>
                  <p>
                    Transfers, mints, borrows, and more — your transactions
                    formed a pattern only you have.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.01] px-3 py-3">
                  <p className="uppercase tracking-[0.22em] text-slate-500 mb-1">
                    Now it&apos;s a recap
                  </p>
                  <p>
                    Bucket turned raw tx data into something you can actually
                    read, remember, and share.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
          <KpiCard
            label="Total Sui Transactions"
            value={summary.totalBucketTxCount.toString()}
            hint="All transactions this address broadcast on Sui in the year."
          />
          <KpiCard
            label="Active Days on Sui"
            value={summary.activeBucketDays.toString()}
            hint="Days where at least one Sui transaction was sent."
          />
          <KpiCard
            label="First Tx in Year"
            value={
              summary.firstBucketTxDate
                ? new Date(summary.firstBucketTxDate).toLocaleDateString()
                : "—"
            }
            hint="When your Sui activity started for this year."
          />
          <KpiCard
            label="Last Tx in Year"
            value={
              summary.lastBucketTxDate
                ? new Date(summary.lastBucketTxDate).toLocaleDateString()
                : "—"
            }
            hint="Most recent transaction in the selected year."
          />
        </section>

        {/* Monthly activity chart */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-left">
              Your rhythm across the year
            </p>
            <p className="text-[11px] text-slate-500">
              Each bar shows how often this address touched Sui in that month.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-[28px] px-4 py-4 h-52 flex items-end gap-3 overflow-x-auto backdrop-blur-lg">
            {summary.activityTimeline.map((m) => {
              const ratio = (m.txCount || 0) / maxTx;
              const height = 20 + ratio * 90;

              return (
                <div
                  key={m.month}
                  className="flex flex-col items-center justify-end gap-1 min-w-[32px]"
                >
                  <div
                    className="w-4 rounded-md bg-gradient-to-t from-slate-100 via-white to-slate-200 shadow-[0_0_18px_rgba(148,163,184,0.9)] transition hover:shadow-[0_0_26px_rgba(248,250,252,1)] hover:scale-[1.03]"
                    style={{ height }}
                  />
                  <span className="text-[9px] text-slate-400">
                    {m.month.slice(5)}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {m.txCount}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Share card + buttons */}
        <section className="space-y-4 pb-10 pt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-sm font-semibold text-left">
              Turn your Sui year into something you can flex
              <span className="block text-[11px] font-normal text-slate-500">
                Copy a text summary or download a 1:1 Bucket-branded image for X
                or Telegram.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2 self-end">
              <CopyShareButton
                twitterHandle={twitterHandle}
                shortAddress={shortAddress}
                summary={summary as BucketYearlySummary}
              />
              <ShareImageButton
                twitterHandle={twitterHandle}
                shortAddress={shortAddress}
                summary={summary as BucketYearlySummary}
                twitterPfpUrl={twitterPfpUrl}
              />
              <a
                href="https://app.bucketprotocol.io"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/20 px-3 py-1.5 text-[11px] text-slate-100 hover:border-white/40 hover:bg-white/5 transition"
              >
                Open Bucket on Sui
              </a>
            </div>
          </div>

          {/* Share Card – 1:1 正方形，給 html-to-image 用 */}
          <div
            id="bucket-share-card"
            style={{ aspectRatio: "1 / 1" }}
            className="mx-auto w-full max-w-md bg-black border border-white/[0.16] rounded-[32px] p-8 text-center shadow-[0_0_90px_-20px_rgba(15,23,42,0.9)] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.45),transparent_65%)] flex flex-col items-center justify-center"
          >
            <img
              src={twitterPfpUrl || "/bucket-default-pfp.png"}
              alt="Share avatar"
              className="w-[84px] h-[84px] rounded-full mx-auto mb-5 shadow-[0_0_40px_rgba(148,163,184,0.9)] object-cover border border-white/30"
            />

            <p className="text-xs tracking-[0.26em] uppercase text-slate-400">
              Sui {summary.year} Wrapped · by Bucket
            </p>

            <h3 className="mt-2 text-2xl font-light text-white">
              {twitterHandle ? `@${twitterHandle}` : shortAddress}
            </h3>

            {/* Tier 名稱顯示在卡片上 */}
            <div className="mt-3 text-[11px] text-slate-200 uppercase tracking-[0.18em]">
              {tier.name}
            </div>

            <p className="mt-3 text-[11px] text-slate-300 px-4">
              {tier.longStory}
            </p>

            <div className="mt-4 space-y-1 text-slate-300 text-sm font-light">
              <p>
                {summary.totalBucketTxCount} Sui transactions in{" "}
                {summary.year}
              </p>
              <p>{summary.activeBucketDays} active days on Sui</p>
            </div>

            {summary.personalityTags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {summary.personalityTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.18] text-[11px] text-slate-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-2">
              <img
                src="/bucket-default-pfp.png"
                alt="Bucket logo"
                className="w-8 h-8 rounded-full opacity-90"
              />
              <p className="text-[10px] text-slate-500 font-light">
                Wrapped experience by Bucket · Built on Sui
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- KPI Card component ---------- */

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.12] rounded-[24px] p-5 text-left space-y-1 backdrop-blur-xl transition hover:border-white/24 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-18px_rgba(148,163,184,1)]">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="text-2xl font-light text-white">{value}</p>
      <p className="text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}

/* ---------- 分級邏輯 ---------- */

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

