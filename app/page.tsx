"use client";

import { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { ConnectButton, useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { LandingCardPreview } from "@/components/LandingCardPreview";

export default function Home() {
  const { data: session } = useSession();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isBinding, setIsBinding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 自動判斷目前步驟
  useEffect(() => {
    if (!session) {
      setStep(1);
    } else if (!currentAccount) {
      setStep(2);
    } else {
      setStep(3);
    }
  }, [session, currentAccount]);

  const handleVerifyAndBind = async () => {
    if (!session || !currentAccount) return;
    setIsBinding(true);
    setErrorMsg("");

    try {
      // 1. 準備簽名訊息
      const message = `Bind Twitter @${(session as any).twitterHandle} to Wallet ${currentAccount.address}`;
      const messageBytes = new TextEncoder().encode(message);

      // 2. 喚起錢包簽名
      const result = await signPersonalMessage({
        message: messageBytes,
      });

      // 3. 發送到後端驗證
      const res = await fetch("/api/campaign/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterId: (session as any).twitterUserId,
          walletAddress: currentAccount.address,
          signature: result.signature,
          messageBytes: Buffer.from(messageBytes).toString('base64')
        }),
      });

      // 4. 🔥 錯誤處理修正：先檢查狀態碼，避免直接解析 HTML 報錯
      if (!res.ok) {
        // 如果伺服器回傳錯誤 (例如 500)，嘗試讀取文字訊息而不是 JSON
        const text = await res.text(); 
        console.error("Bind API Error:", text);
        try {
            // 嘗試解析 JSON 錯誤訊息
            const json = JSON.parse(text);
            throw new Error(json.error || `Binding failed (${res.status})`);
        } catch (e) {
            // 如果不是 JSON，拋出一般錯誤
            throw new Error(`Server Error (${res.status}): Please check console.`);
        }
      }

      // 如果成功，再解析 JSON
      const data = await res.json();
      
      // 5. 跳轉到結果頁
      router.push(`/wrapped/${currentAccount.address}?year=2025`);

    } catch (err: any) {
      console.error("Verification failed:", err);
      setErrorMsg(err.message || "Signing failed. Please try again.");
    } finally {
      setIsBinding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 背景裝飾 */}
      <div className="fixed inset-0 pointer-events-none select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full opacity-60" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 blur-[150px] rounded-full opacity-60" />
      </div>

      {/* 主要內容容器 (Grid 佈局) */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* 左側：表單區塊 */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/bucket-default-pfp.png" className="w-10 h-10" alt="Logo" />
                    <span className="text-xl font-bold font-sans">Bucket Protocol</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Your 2025 <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        On-Chain Legacy
                    </span>
                </h1>
                <p className="text-lg text-slate-400 mt-4 max-w-md leading-relaxed">
                  Connect your accounts to mint your personalized year-in-review card. Reveal your score, rewards, and ecosystem footprint.
                </p>
            </div>

            {/* 連接流程表單 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                
                <div className="space-y-5 relative">
                    {/* 連接線 */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10 -z-10" />

                    {/* STEP 1: Twitter */}
                    <div className={`flex gap-4 transition-all duration-500 ${step > 1 ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${session ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'}`}>
                            {session ? '✓' : '1'}
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="font-bold text-sm mb-2 flex items-center justify-between">
                                <span>Connect X (Twitter)</span>
                                {session && <span className="text-[10px] text-green-400 font-mono">Verified</span>}
                            </h3>
                            {!session ? (
                                <button onClick={() => signIn("twitter")} className="w-full py-3 bg-[#0f1419] hover:bg-[#1a202c] text-white font-bold rounded-xl text-sm border border-white/10 transition flex items-center justify-center gap-2">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                                    Sign In with X
                                </button>
                            ) : (
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                    <span className="text-sm font-bold text-slate-300">@{(session as any).twitterHandle}</span>
                                    <button onClick={() => signOut()} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition">Change</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STEP 2: Wallet */}
                    <div className={`flex gap-4 transition-all duration-500 ${step === 2 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${currentAccount ? 'bg-green-500/20 border-green-500 text-green-400' : (step >= 2 ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'border-white/20 text-slate-500')}`}>
                            {currentAccount ? '✓' : '2'}
                        </div>
                        <div className="flex-1 pt-1 relative z-10">
                            <h3 className="font-bold text-sm mb-2 flex items-center justify-between">
                                <span>Connect Sui Wallet</span>
                                {currentAccount && <span className="text-[10px] text-green-400 font-mono">Connected</span>}
                            </h3>
                            <div className="sui-connect-button-wrapper [&>button]:w-full [&>button]:justify-center [&>button]:py-3 [&>button]:!bg-gradient-to-r [&>button]:from-blue-600 [&>button]:to-indigo-600 [&>button]:hover:from-blue-500 [&>button]:hover:to-indigo-500 [&>button]:!text-white [&>button]:!font-bold [&>button]:!rounded-xl [&>button]:!border-0 [&>button]:shadow-lg">
                                <ConnectButton className="w-full" />
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: Sign */}
                    <div className={`flex gap-4 transition-all duration-500 ${step === 3 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${step === 3 ? 'bg-cyan-500 border-cyan-500 text-white animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-white/20 text-slate-500'}`}>
                            3
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="font-bold text-sm mb-2">Mint Your Card</h3>
                            <button 
                                onClick={handleVerifyAndBind}
                                disabled={step !== 3 || isBinding}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-base transition shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                {isBinding ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Verifying...</>
                                ) : (
                                    <>Sign & Reveal Legacy</>
                                )}
                            </button>
                            {errorMsg && <p className="text-xs text-red-400 mt-3 text-center bg-red-950/30 p-2 rounded border border-red-900/50">{errorMsg}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 右側：視覺區塊 (Mock Card) */}
        <div className="flex items-center justify-center order-1 lg:order-2 animate-float-slow">
            <LandingCardPreview />
        </div>

      </div>
    </main>
  );
}

