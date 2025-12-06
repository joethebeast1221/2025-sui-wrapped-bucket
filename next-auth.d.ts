import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    twitterHandle?: string;
    twitterPfpUrl?: string;
    twitterUserId?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    twitterHandle?: string;
    twitterPfpUrl?: string;
    twitterUserId?: string;
  }
}
