/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge"; // Edge runtime 比較適合做圖

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const handle = searchParams.get("handle") || "";
  const shortAddress = searchParams.get("addr") || "";
  const tx = searchParams.get("tx") || "0";
  const days = searchParams.get("days") || "0";
  const sentence =
    searchParams.get("sentence") || "Your year with Bucket on Sui.";
  const pfp = searchParams.get("pfp") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 60,
          background:
            "radial-gradient(circle at 10% 20%, #1b3254 0%, #020408 55%, #000000 100%)",
          color: "white",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        }}
      >
        {/* 左邊：文字區 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 16,
              letterSpacing: 6,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Bucket 2025 Wrapped
          </div>

          <div
            style={{
              fontSize: 38,
              fontWeight: 300,
              lineHeight: 1.25,
              maxWidth: 640,
            }}
          >
            {sentence}
          </div>

          <div
            style={{
              fontSize: 22,
              opacity: 0.9,
            }}
          >
            {tx} Bucket transactions · {days} active days on Sui
          </div>

          <div
            style={{
              fontSize: 18,
              opacity: 0.7,
            }}
          >
            {handle ? `@${handle}` : shortAddress}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              opacity: 0.55,
            }}
          >
            Built with real on-chain data from Bucket Protocol on Sui.
          </div>
        </div>

        {/* 右邊：PFP 卡片 */}
        <div
          style={{
            width: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 180,
              height: 180,
              borderRadius: 48,
              background:
                "radial-gradient(circle at 30% 10%, rgba(93,188,252,0.8), rgba(0,0,0,0.9))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 45px rgba(56,189,248,0.75), 0 0 120px rgba(15,118,110,0.7)",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.28)",
            }}
          >
            {pfp ? (
              <img
                src={pfp}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: 72,
                }}
              >
                🪣
              </span>
            )}
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


