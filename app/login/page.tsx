"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/toolbox";

  const isAccessDenied = error === "AccessDenied";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient blobs */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(220 80% 60%), transparent)" }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center gap-6">

          {/* Logo + branding */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 text-primary"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Connect Placecom
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ashoka University Placement Committee
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border/50" />

          {/* Headline */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Sign in to access the Toolbox
            </h2>
            <p className="text-sm text-muted-foreground">
              Restricted to{" "}
              <span className="font-medium text-primary">@ashoka.edu.in</span> accounts
            </p>
          </div>

          {/* Error state */}
          {isAccessDenied && (
            <div className="w-full rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive text-center">
              <strong>Access denied.</strong> Only <code>@ashoka.edu.in</code> email addresses are
              permitted.
            </div>
          )}

          {error && !isAccessDenied && (
            <div className="w-full rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive text-center">
              Something went wrong during sign-in. Please try again.
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-muted/60 active:scale-[0.98] transition-all duration-150 px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:shadow-md"
          >
            {/* Google SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5 shrink-0"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 ml-auto opacity-40 group-hover:translate-x-0.5 group-hover:opacity-70 transition-all"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <p className="text-xs text-muted-foreground text-center px-4">
            By signing in you agree to our usage policies. Your data is protected under the
            Ashoka University privacy framework.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
