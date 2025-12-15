import { NextResponse } from "next/server";
import { verifyPersonalMessage } from "@mysten/sui.js/verify";

// 模擬資料庫 (正式環境請換成 KV 或 SQL)
let usersDB: any[] = []; 

export async function POST(request: Request) {
  try {
    const { twitterId, walletAddress, signature, messageBytes } = await request.json();

    if (!twitterId || !walletAddress || !signature || !messageBytes) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. 驗證簽名 (Verify Signature)
    // 這確保了發送請求的人真的擁有該錢包私鑰
    try {
      const publicKey = await verifyPersonalMessage(new Uint8Array(Buffer.from(messageBytes, 'base64')), signature);
      if (publicKey.toSuiAddress() !== walletAddress) {
         return NextResponse.json({ error: "Signature invalid for this address" }, { status: 401 });
      }
    } catch (e) {
      console.error("Sig Verify Failed", e);
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 2. 檢查綁定狀態 (Anti-Sybil)
    // 檢查 Twitter 是否已綁定其他錢包
    const existingTwitter = usersDB.find(u => u.twitterId === twitterId);
    if (existingTwitter && existingTwitter.walletAddress !== walletAddress) {
        return NextResponse.json({ error: "This Twitter is already bound to another wallet." }, { status: 409 });
    }

    // 檢查錢包是否已綁定其他 Twitter
    const existingWallet = usersDB.find(u => u.walletAddress === walletAddress);
    if (existingWallet && existingWallet.twitterId !== twitterId) {
        return NextResponse.json({ error: "This Wallet is already bound to another Twitter." }, { status: 409 });
    }

    // 3. 綁定成功，寫入/更新資料庫
    if (!existingTwitter && !existingWallet) {
        usersDB.push({ twitterId, walletAddress, boundAt: new Date() });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}