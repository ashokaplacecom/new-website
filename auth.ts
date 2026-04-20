import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createAdminClient } from "@/lib/supabase/server";

const TEN_DAYS_SECONDS = 10 * 24 * 60 * 60; // 864_000s

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPoc: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    isPoc?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  // Supabase adapter: persists users & accounts in next_auth schema.
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  // JWT strategy: session token lives in a signed cookie, not the DB.
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

    // Enrich JWT with user id and POC status on first sign-in
    async jwt({ token, user, profile }) {
      if (user?.id) {
        token.userId = user.id;
      }
      if (profile?.picture) {
        token.picture = profile.picture as string;
      }
      
      // Fetch POC status if not already determined in the token
      if (token.isPoc === undefined && token.email) {
        try {
          const supabase = createAdminClient();
          const { data } = await supabase
            .schema("requests")
            .from("pocs")
            .select("id")
            .eq("email", token.email)
            .single();
            
          token.isPoc = !!data;
        } catch (error) {
          // If the lookup fails (e.g. no rows returned, which throws in .single()), they are not a POC
          token.isPoc = false;
        }
      }
      
      return token;
    },

    // Expose enriched fields to client session
    async session({ session, token }) {
      if (session.user) {
        if (token.userId) session.user.id = token.userId as string;
        if (token.picture) session.user.image = token.picture as string;
        if (token.isPoc !== undefined) session.user.isPoc = token.isPoc as boolean;
      }
      return session;
    },
  },
});
