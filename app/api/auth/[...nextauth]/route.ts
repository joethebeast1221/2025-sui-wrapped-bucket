// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // 2024-2025 Twitter new OAuth standard
      authorization: {
        params: {
          scope: "tweet.read users.read offline.access",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        /**
         * Twitter OAuth2 (2024–2025) 回傳的 profile 格式：
         * {
         *   data: {
         *      id: "123",
         *      name: "xxxxx",
         *      username: "xxxx",
         *      profile_image_url: "https://..."
         *   }
         * }
         */
        const p = profile as any;

        const data = p?.data ?? p ?? {};

        token.twitterUserId = data.id;
        token.twitterHandle = data.username;
        token.twitterPfpUrl = data.profile_image_url;
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

