import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Permitted external/extension origins for the public API
const ALLOWED_ORIGINS = [
    "https://app.joinsuperset.com",
    "chrome-extension://debmlfjpofnpjlafiicfcgdmfgkpaaoj",
];

// Page routes that require an authenticated session
const PROTECTED_ROUTES = ["/toolbox", "/submit-opportunity", "/admin"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── 1. API routes — CORS + API-key gate + Trailing Slash Bypass ─────────
    if (pathname.startsWith("/api/")) {
        const origin = req.headers.get("origin") ?? "";
        const isAllowedOrigin =
            ALLOWED_ORIGINS.includes(origin) || origin.includes("localhost");

        // Preflight
        if (req.method === "OPTIONS") {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                },
            });
        }

        // NextAuth's own routes (/api/auth/*) must ALWAYS pass through untouched.
        if (pathname.startsWith("/api/auth/")) {
            return NextResponse.next();
        }

        // API key validation for all other /api/* routes
        const apiKey = req.headers.get("x-api-key");
        const isWebExtension = apiKey === process.env.API_KEY_WEB_EXTENSION;
        const isFrontend = apiKey === process.env.API_KEY_FRONTEND;

        const isPublicGet =
            pathname === "/api/duperset/external-opportunities" &&
            req.method === "GET";

        // For the submission form, we allow POST without an API key IF the user is authenticated.
        const isInternalSubmission = 
            pathname === "/api/duperset/external-opportunities" && 
            req.method === "POST";

        if (!apiKey || (!isWebExtension && !isFrontend)) {
            // If No API key, check if it's a public GET or an internal authenticated POST
            let authenticated = false;
            if (isInternalSubmission) {
                 // We'll verify the token here since we are in the API block
                 const token = await getToken({
                    req,
                    secret: process.env.AUTH_SECRET!,
                    secureCookie: process.env.NODE_ENV === "production",
                    salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
                });
                if (token) authenticated = true;
            }

            if (!(isPublicGet && isAllowedOrigin) && !authenticated) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        if (isWebExtension) {
            if (
                origin !== process.env.ALLOWED_EXTENSION_ORIGIN &&
                !isAllowedOrigin
            ) {
                return NextResponse.json(
                    { error: "Unauthorized Origin" },
                    { status: 401 }
                );
            }
        }

        // Check if the original URL has a trailing slash. Next.js natively issues a 308 redirect,
        // which breaks POST requests from extensions. We intercept and rewrite seamlessly instead.
        const originalUrl = new URL(req.url);
        const hasTrailingSlash = originalUrl.pathname.endsWith("/") && originalUrl.pathname !== "/";
        
        let response = NextResponse.next();
        if (hasTrailingSlash) {
            const urlWithoutSlash = new URL(originalUrl.pathname.slice(0, -1), req.url);
            urlWithoutSlash.search = req.nextUrl.search; // Preserve query params
            response = NextResponse.rewrite(urlWithoutSlash);
        }

        if (isAllowedOrigin) {
            response.headers.set("Access-Control-Allow-Origin", origin);
            response.headers.set(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            response.headers.set(
                "Access-Control-Allow-Headers",
                "Content-Type, x-api-key"
            );
        }
        return response;
    }

    // ── 2. Protected page routes — verify JWT cookie directly ─────────────────
    const isProtected = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtected) {
        // getToken reads and verifies the signed JWT cookie in Edge Runtime.
        const token = await getToken({
            req,
            secret: process.env.AUTH_SECRET!,
            secureCookie: process.env.NODE_ENV === "production",
            salt:
                process.env.NODE_ENV === "production"
                    ? "__Secure-authjs.session-token"
                    : "authjs.session-token",
        });

        if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", req.url);
            return NextResponse.redirect(loginUrl);
        }

        // ── 3. Role-based access control ──────────────────────────────────────────
        if (pathname.startsWith("/toolbox/pocs") && token.isPoc !== true) {
            return NextResponse.redirect(new URL("/toolbox", req.url));
        }

        // Only admins can access the CMS admin panel
        if (pathname.startsWith("/admin") && token.isAdmin !== true) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/:path*",
        "/toolbox",
        "/toolbox/:path*",
        "/submit-opportunity",
        "/submit-opportunity/:path*",
        "/admin",
        "/admin/:path*",
    ],
};
