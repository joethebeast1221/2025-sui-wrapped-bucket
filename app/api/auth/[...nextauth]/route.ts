import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        params: {
          scope: "tweet.read users.read offline.access",
        },
      },
      profile(profile) {
        const data = profile.data || profile;
        
        // 關鍵修正：Twitter 圖片網址通常是 ".../xg8..._normal.jpg"
        // 我們要把 "_normal" 拿掉，直接取得原圖 (Original Quality)
        let imageUrl = data.profile_image_url;
        if (imageUrl) {
          imageUrl = imageUrl.replace("_normal", ""); 
        }

        return {
          id: data.id,
          name: data.name,
          image: imageUrl, // 這裡存入的就是高畫質連結
          username: data.username,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as any;
        const data = p?.data ?? p ?? {};
        
        token.twitterUserId = data.id;
        token.twitterHandle = data.username;
        
        // JWT 層也要確保是高畫質
        let img = data.profile_image_url;
        if (img) {
          img = img.replace("_normal", "");
        }
        token.twitterPfpUrl = img;
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
