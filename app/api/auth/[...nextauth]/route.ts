// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ 從 lib/auth 導入，而不是定義在這裡

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
