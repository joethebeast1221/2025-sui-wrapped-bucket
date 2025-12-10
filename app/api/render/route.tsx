/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const handle = searchParams.get("handle") || "";
  const shortAddress = searchParams.get("addr") || "";
  const tx = searchParams.get("tx") || "0";
  const days = searchParams.get("days") || "0";
  const pfp = searchParams.get("pfp") || "";

  // 1200x630 (OG standard) 或者是直式。為了讓 Link Preview 正常，通常還是維持橫式，但內容排版我們讓它像卡片。
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020408",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background gradient */}
        <div style={{ position: "absolute", width: "1000px", height: "1000px", background: "rgba(59,130,246,0.2)", filter: "blur(200px)", borderRadius: "500px" }} />

        {/* The Card (Vertical centered) */}
        <div style={{
            width: 340,
            height: 520,
            background: "#080c14",
            borderRadius: 32,
            border: "2px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 30,
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', color: '#94a3b8', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 }}>
                <span>Bucket Wrapped</span>
                <span>2025</span>
            </div>

            {/* Avatar & Name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                {pfp ? (
                    <img src={pfp} style={{ width: 120, height: 120, borderRadius: 60, border: "4px solid #1e293b" }} />
                ) : (
                    <div style={{ width: 120, height: 120, borderRadius: 60, background: "#1e293b" }} />
                )}
                <div style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>{handle || shortAddress}</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 36, color: 'white', fontWeight: 'bold' }}>{tx}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Transactions</span>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 36, color: 'white', fontWeight: 'bold' }}>{days}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Active Days</span>
                </div>
            </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}


