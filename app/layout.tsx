// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./Providers";

// 修正：引用位於根目錄 fonts/ 下的字體檔案
// 使用 ".." 跳出 app 資料夾，進入 fonts 資料夾
const ttInterphases = localFont({
  src: "../fonts/TT_Interphases_Pro_Medium.ttf",
  variable: "--font-tt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sui 2025 Wrapped | Presented by Bucket",
  description: "Check your 2025 on-chain journey on Sui. Powered by Bucket Protocol.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${ttInterphases.variable} antialiased bg-[#020408] text-white font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

