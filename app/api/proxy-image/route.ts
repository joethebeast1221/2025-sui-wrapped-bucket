// app/api/proxy-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // 使用 Edge 讓速度更快

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    // 後端去抓取原始圖片 (繞過 CORS)
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // 回傳圖片給前端，並加上適當的 Header
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 快取一天
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}