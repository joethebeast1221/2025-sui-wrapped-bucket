"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { SeasonCountdown } from "@/components/SeasonCountdown";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const anySession = session as any | null;
  const twitterHandle = anySession?.twitterHandle as string | undefined;
  const twitterPfpUrl = anySession?.twitterPfpUrl as string | undefined;

  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;

    setIsLoading(true);
    const year = 2025;
    router.push(`/wrapped/${trimmed}?year=${year}`);
  };

  const avatarUrl = twitterPfpUrl || "/bucket-default-pfp.png";
  const displayName = twitterHandle ? `@${twitterHandle}` : "Your handle";

  return (
    <main className="relative min-h-screen bg-black overflow-hidden text-white">
      {/* Background glows */}
      <div className="absolute inset-0 bg-black" />
      <div className="pointer-events-none absolute -top-72 right-[-8rem] w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.85),transparent_65%)] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-22rem] left-[-12rem] w-[55vw] h-[55vw] bg-[radial-gradient(circle_at_100%_100%,rgba(15,23,42,0.95),transparent_60%)] blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-10 min-h-screen flex flex-col justify-center">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 mb-8 md:mb-10">
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
              <span className="text-[10px] text-slate-300 tracking-[0.22em] uppercase">
                Sui 2025 Wrapped
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SeasonCountdown targetIso="2026-01-15T00:00:00Z" />
          </div>
        </header>

        {/* Main layout */}
        <section className="flex flex-col md:flex-row items-start gap-10">
          {/* Left: 3-step flow */}
          <div className="w-full md:w-[54%] space-y-5">
            {/* Hero copy */}
            <div className="space-y-3">
              <p className="text-[11px] tracking-[0.24em] uppercase text-slate-300">
                Your Sui year, Bucket-branded
              </p>
              <h1 className="text-[30px] md:text-[38px] font-light leading-tight">
                Connect your identity,
                <br className="hidden md:block" />
                drop a Sui address,
                <br className="hidden md:block" />
                get your Wrapped card.
              </h1>
              <p className="text-sm md:text-base text-slate-300 font-light max-w-xl">
                We turn your 2025 Sui transactions into a shareable, 1:1
                Bucket-themed recap — tier, active days, and your Twitter avatar
                woven into the card.
              </p>
            </div>

            {/* Step 1 */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.12] px-4 py-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Step 1 · Connect Twitter
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optional · we only use your handle and avatar to personalize
                    the card.
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 text-slate-300">
                  Optional
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                {status === "authenticated" ? (
                  <>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <img
                        src={avatarUrl}
                        alt="Twitter avatar"
                        className="w-6 h-6 rounded-full object-cover border border-white/40"
                      />
                      <span>
                        Connected{" "}
                        {twitterHandle ? `@${twitterHandle}` : "Twitter"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="text-[11px] text-slate-400 underline underline-offset-4 hover:text-slate-100"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-400">
                      Connect to let Wrapped use your X avatar on the card.
                    </p>
                    <button
                      type="button"
                      onClick={() => signIn("twitter")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3 py-1.5 text-[11px] font-medium shadow-[0_0_28px_rgba(248,250,252,0.8)] hover:shadow-[0_0_40px_rgba(248,250,252,1)] hover:-translate-y-0.5 transition"
                    >
                      <span className="inline-block w-3 h-3 rounded-[4px] bg-black" />
                      <span>Connect X (Twitter)</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.18] px-4 py-4 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">
                Step 2 · Insert Sui address
              </p>
              <p className="text-xs text-slate-400">
                We&apos;ll pull every transaction this address broadcast on Sui
                in 2025 and turn it into your yearly recap.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-2 space-y-3 max-w-xl"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="0x... or your Sui address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 rounded-2xl bg-black/40 border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/50 focus:bg-black/30 transition"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="sm:w-44 rounded-2xl bg-white text-black text-sm font-medium px-4 py-2.5 shadow-[0_0_40px_rgba(248,250,252,0.7)] hover:shadow-[0_0_52px_rgba(248,250,252,0.9)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none transition"
                  >
                    {isLoading
                      ? "Stitching your year..."
                      : "Generate my Sui card"}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  No signing, no private keys. Everything comes from public Sui
                  transaction history.
                </p>
              </form>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.12] px-4 py-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">
                Step 3 · Get your Wrapped card
              </p>
              <p className="text-xs text-slate-400">
                After you submit, we&apos;ll take you to the Wrapped page where
                you&apos;ll see your tier, activity overview, and a Bucket-style
                1:1 share card you can download or post on X / Telegram.
              </p>
            </div>
          </div>

          {/* Right: Preview card (uses Twitter avatar if connected) */}
          <div className="w-full md:w-[46%] flex justify-center md:justify-end">
            <div
              style={{ aspectRatio: "1 / 1" }}
              className="w-full max-w-sm bg-black border border-white/[0.16] rounded-[32px] p-8 text-center shadow-[0_0_90px_-20px_rgba(15,23,42,0.9)] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.45),transparent_65%)] flex flex-col items-center justify-center"
            >
              {/* PFP + Bucket frame */}
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
                Preview · Sui 2025 Wrapped
              </p>

              <h3 className="mt-2 text-xl font-light text-white">
                {displayName}
              </h3>

              <div className="mt-3 text-[11px] text-slate-200 uppercase tracking-[0.18em]">
                CURRENT NATIVE
              </div>

              <p className="mt-3 text-[11px] text-slate-300 px-4">
                You moved with Sui&apos;s currents — protocols, mints, swaps,
                loops. On-chain is where you actually live.
              </p>

              <div className="mt-4 space-y-1 text-slate-300 text-sm font-light">
                <p>256 Sui transactions in 2025</p>
                <p>68 active days on Sui</p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
                <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.18] text-slate-100">
                  Long-term farmer
                </span>
                <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.18] text-slate-100">
                  Stable stacker
                </span>
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
        </section>
      </div>
    </main>
  );
}

