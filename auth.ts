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
      pocId?: number;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    isPoc?: boolean;
    pocId?: number;
    isAdmin?: boolean;
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

    // Enrich JWT with user id, POC status, and admin status on first sign-in
    async jwt({ token, user, profile }) {
      if (user?.id) {
        token.userId = user.id;
      }
      if (profile?.picture) {
        token.picture = profile.picture as string;
      }

      // Fetch roles if not already determined in the token
      if (token.email) {
        const supabase = createAdminClient();
        console.log(`[Auth] Checking roles for: ${token.email}`);

        // ── Check POC status ──
        try {
          const { data: pocData, error: pocError } = await supabase
            .schema("requests")
            .from("pocs")
            .select("id")
            .eq("email", token.email)
            .single();

          if (pocError && pocError.code !== 'PGRST116') {
             console.error("[Auth] POC check error:", pocError);
          }

          token.isPoc = !!pocData;
          if (pocData?.id) {
            token.pocId = pocData.id;
          }
        } catch (err) {
          console.error("[Auth] POC catch error:", err);
          token.isPoc = false;
        }

        // ── Check Admin status ──
        try {
          const { data: adminData, error: adminError } = await supabase
            .from("admin")
            .select("id")
            .eq("email", token.email)
            .single();

          if (adminError && adminError.code !== 'PGRST116') {
            console.error("[Auth] Admin check error:", adminError);
          }

          token.isAdmin = !!adminData;
          console.log(`[Auth] isAdmin for ${token.email}: ${token.isAdmin}`);
        } catch (err) {
          console.error("[Auth] Admin catch error:", err);
          token.isAdmin = false;
        }
      }

      return token;
    },

    // Expose enriched fields to client session
    async session({ session, token }) {
      if (session.user) {
        if (token.userId) session.user.id = token.userId as string;
        if (token.picture) session.user.image = token.picture as string;
        session.user.isPoc = token.isPoc ?? false;
        if (token.pocId !== undefined) session.user.pocId = token.pocId as number;
        session.user.isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
  },
});
