import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // 1. 驗證密碼
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. 從 Redis 撈取資料
    const registry = await kv.hgetall("bucket_user_registry");

    if (!registry) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // 3. 資料處理
    const users = Object.values(registry).map((item: any) => 
      typeof item === 'string' ? JSON.parse(item) : item
    );

    // 4. 定義 CSV 欄位名稱 (Header)
    const csvHeader = ["Address", "Score", "Tier", "ProtocolCount", "Handle", "Avatar", "Timestamp"];
    
    // 5. 將數據轉換為 CSV 格式的字串
    const csvRows = users.map((user: any) => {
      // 處理欄位內容，避免逗號破壞格式 (例如 handle 裡有逗號)
      const safe = (str: any) => `"${String(str || "").replace(/"/g, '""')}"`;
      
      return [
        safe(user.address),
        safe(user.score),
        safe(user.tier),
        safe(user.protocolCount),
        safe(user.handle),
        safe(user.avatar),
        // 將 timestamp 轉為可讀時間
        safe(new Date(user.timestamp).toISOString())
      ].join(",");
    });

    // 加入 BOM (\uFEFF) 防止 Excel 開啟時中文亂碼
    const csvString = "\uFEFF" + [csvHeader.join(","), ...csvRows].join("\n");

    // 6. 設定 Response Header 強制下載
    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        // attachment 表示下載，filename 設定預設檔名
        "Content-Disposition": `attachment; filename="bucket-users-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}