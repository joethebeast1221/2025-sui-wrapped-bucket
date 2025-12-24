// lib/auth.ts
import { NextAuthOptions } from "next-auth";
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
      // ✅ Fix: 明確指定型別為 any，解決 "implicitly has an 'any' type" 錯誤
      profile(profile: any) {
        const data = profile.data || profile;
        
        let imageUrl = data.profile_image_url;
        if (imageUrl) {
          imageUrl = imageUrl.replace("_normal", ""); 
        }

        return {
          id: data.id,
          name: data.name,
          image: imageUrl,
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