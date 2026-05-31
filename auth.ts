import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Function to load Google credentials from JSON if env vars are missing
const getGoogleCredentials = () => {
  const envId = process.env.AUTH_GOOGLE_ID;
  const envSecret = process.env.AUTH_GOOGLE_SECRET;

  if (envId && envSecret) {
    return { clientId: envId, clientSecret: envSecret };
  }

  try {
    const jsonPath = path.join(process.cwd(), "client_secret.json");
    if (fs.existsSync(jsonPath)) {
      const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      return {
        clientId: content.web.client_id,
        clientSecret: content.web.client_secret,
      };
    }
  } catch (error) {
    console.error("[Auth] Failed to load client_secret.json:", error);
  }

  return { clientId: envId!, clientSecret: envSecret! };
};

const googleCredentials = getGoogleCredentials();

const getRedirectProxyUrl = () => {
  const url = process.env.NEXTAUTH_URL;
  if (!url) return undefined;
  return url.includes("/api/auth")
    ? url
    : `${url.replace(/\/$/, "")}/api/auth`;
};

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
    googlePicture?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  redirectProxyUrl: getRedirectProxyUrl(),
  providers: [
    Google({
      clientId: googleCredentials.clientId,
      clientSecret: googleCredentials.clientSecret,
    }),
  ],

  // Prisma adapter: persists users & accounts in next_auth schema.
  adapter: PrismaAdapter(prisma),

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
        token.googlePicture = profile.picture as string;
      }

      // Fetch roles if not already determined in the token
      if (token.email && token.isPoc === undefined && token.isAdmin === undefined) {
        console.log(`[Auth] Checking roles for: ${token.email}`);

        // ── Check POC status ──
        try {
          const pocData = await prisma.pocs.findUnique({
            where: { email: token.email },
            select: { id: true }
          });

          token.isPoc = !!pocData;
          if (pocData?.id) {
            token.pocId = Number(pocData.id);
          }
        } catch (err) {
          console.error("[Auth] POC catch error:", err);
          token.isPoc = false;
        }

        // ── Check Admin status ──
        try {
          const adminData = await prisma.admin.findFirst({
            where: { email: token.email },
            select: { id: true }
          });

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
        
        // Prioritize googlePicture which is not overwritten by database user.image checks
        if (token.googlePicture) {
          session.user.image = token.googlePicture as string;
        } else if (token.picture) {
          session.user.image = token.picture as string;
        }

        session.user.isPoc = token.isPoc ?? false;
        if (token.pocId !== undefined) session.user.pocId = token.pocId as number;
        session.user.isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
  },
});
