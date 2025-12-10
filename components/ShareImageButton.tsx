"use client";

import React from "react";
import * as htmlToImage from "html-to-image";
import type { SuiYearlySummary } from "@/lib/types";

interface ShareImageButtonProps {
  twitterHandle?: string;
  shortAddress: string;
  summary: SuiYearlySummary;
  twitterPfpUrl?: string;
}

export function ShareImageButton(props: ShareImageButtonProps) {
  const { twitterHandle, shortAddress } = props;
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    const node = document.getElementById("share-card-export");
    if (!node) {
      console.error("Card element not found: share-card-export");
      return;
    }

    try {
      setDownloading(true);

      const options = {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "transparent",
        width: 340,
        height: 520,
      };

      // 1. 處理圖片代理 (Proxy Image) - 解決跨域問題
      const imgs = node.querySelectorAll("img");
      const backups: { el: HTMLImageElement, src: string, crossOrigin: string | null }[] = [];

      // 使用 Promise.all 確保所有圖片都處理完畢
      await Promise.all(
        Array.from(imgs).map(async (img) => {
          // 檢查是否為外部圖片 (非本站圖片)
          if (img.src.startsWith("http") && !img.src.includes(window.location.origin)) {
            // 備份原始狀態
            backups.push({
              el: img,
              src: img.src,
              crossOrigin: img.getAttribute("crossorigin"),
            });

            // 建立 Proxy URL
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(img.src)}`;

            // 預先載入圖片，確保替換時圖片已經 Ready
            await new Promise((resolve) => {
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = proxyUrl; 
                    img.crossOrigin = "anonymous"; 
                    resolve(true);
                };
                tempImg.onerror = () => {
                    // 如果 Proxy 失敗，換成預設圖，避免下載空白
                    img.src = "/bucket-default-pfp.png";
                    resolve(false); 
                };
                tempImg.src = proxyUrl;
            });
          }
        })
      );

      // 2. 截圖
      const dataUrl = await htmlToImage.toPng(node, options);

      // 3. 還原圖片 (恢復原始連結)
      backups.forEach(({ el, src, crossOrigin }) => {
        el.src = src;
        if (crossOrigin) el.setAttribute("crossorigin", crossOrigin);
        else el.removeAttribute("crossorigin");
      });

      // 4. 下載
      const link = document.createElement("a");
      const baseName = twitterHandle ? `@${twitterHandle}` : shortAddress;
      link.download = `Sui2025-${baseName}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error("Image generation failed", err);
      alert("Could not generate high-res image. Please use screenshot.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="flex-1 rounded-2xl border-2 border-white/20 bg-white/5 px-6 py-4 text-white font-bold hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      {downloading ? (
        <span className="animate-pulse text-xs">Processing...</span>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Save Image</span>
        </>
      )}
    </button>
  );
}




