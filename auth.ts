import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const TEN_DAYS_SECONDS = 10 * 24 * 60 * 60; // 864_000s

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  // Supabase adapter: persists users & accounts in next_auth schema.
  // Only used in Node.js runtime (API routes, Server Components) — NOT in middleware.
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  // JWT strategy: session token lives in a signed cookie, not the DB.
  // This keeps things portable and works alongside the adapter (adapter
  // only writes user/account records, not sessions).
  session: {
    strategy: "jwt",
    maxAge: TEN_DAYS_SECONDS,
  },

  jwt: {
    maxAge: TEN_DAYS_SECONDS,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // Block sign-in for non-@ashoka.edu.in accounts
    async signIn({ profile }) {
      if (!profile?.email?.endsWith("@ashoka.edu.in")) {
        return false;
      }
      return true;
    },

    // Enrich JWT with user id on first sign-in
    async jwt({ token, user, profile }) {
      if (user?.id) {
        token.userId = user.id;
      }
      if (profile?.picture) {
        token.picture = profile.picture as string;
      }
      return token;
    },

    // Expose enriched fields to client session
    async session({ session, token }) {
      if (session.user) {
        if (token.userId) session.user.id = token.userId as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
