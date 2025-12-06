"use client";

import React from "react";
import * as htmlToImage from "html-to-image";
import type { BucketYearlySummary } from "@/lib/types";

interface ShareImageButtonProps {
  twitterHandle?: string;
  shortAddress: string;
  summary: BucketYearlySummary;
  twitterPfpUrl?: string;
}

export function ShareImageButton(props: ShareImageButtonProps) {
  const { twitterHandle, shortAddress, summary } = props;
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    const node = document.getElementById("bucket-share-card");
    if (!node) {
      console.error("bucket-share-card element not found");
      return;
    }

    try {
      setDownloading(true);

      // 1) 暫時把所有外部圖片換成本地 logo，避免跨網域汙染 canvas
      const imgs = Array.from(node.querySelectorAll("img")) as HTMLImageElement[];
      const originalSrcs = imgs.map((img) => img.src);

      imgs.forEach((img) => {
        // 簡單判斷：只要是 http(s) 開頭就當作外部圖
        if (img.src.startsWith("http")) {
          img.setAttribute("data-original-src", img.src);
          img.src = "/bucket-default-pfp.png";
        }
      });

      // 2) 算出目前卡片的實際寬高，取較大那個做縮放基準
      const rect = node.getBoundingClientRect();
      const baseSize = Math.max(rect.width, rect.height) || 1;

      // 我們想輸出 1024x1024 正方形
      const targetSize = 1024;
      const scale = targetSize / baseSize;

      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        backgroundColor: "#000000",
        width: targetSize,
        height: targetSize,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        },
      });

      // 3) 把圖片 src 還原
      imgs.forEach((img, i) => {
        const original = originalSrcs[i];
        if (original) img.src = original;
      });

      // 4) 下載檔案
      const link = document.createElement("a");
      const baseName = twitterHandle ? `@${twitterHandle}` : shortAddress;
      link.download = `${baseName}-bucket-wrapped-${summary.year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("下載圖片時發生錯誤，請再試一次或截圖代替。");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="rounded-xl border border-white/30 bg-transparent px-3 py-2 text-xs text-slate-100 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition"
    >
      {downloading ? "Generating…" : "Download image"}
    </button>
  );
}




