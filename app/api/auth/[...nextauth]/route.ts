// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // 若有問題可改成省略 / 1.0a，依實際 Twitter Provider 文件調整
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 這裡依照 Twitter 回傳格式把資料塞進 token
      if (account && profile) {
        // 不同版本 API 傳回格式可能不一樣，這裡做幾種嘗試
        const anyProfile = profile as any;
        token.twitterUserId = anyProfile.data?.id ?? anyProfile.id;
        token.twitterHandle =
          anyProfile.data?.username ?? anyProfile.screen_name ?? "";
        token.twitterPfpUrl =
          anyProfile.data?.profile_image_url ??
          anyProfile.profile_image_url_https ??
          anyProfile.profile_image_url ??
          "";
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).twitterUserId = token.twitterUserId;
      (session as any).twitterHandle = token.twitterHandle;
      (session as any).twitterPfpUrl = token.twitterPfpUrl;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
