import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { auth } from "@/auth";

const execAsync = promisify(exec);

export async function POST() {
  const session = await auth();

  // Enforce strict RBA
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Stage CMS content changes, commit (noop if nothing changed), then
    // pull --rebase to fast-forward over any commits that landed on remote
    // since our last sync, and finally push. Using semicolons so each step
    // runs regardless of the previous exit code (git commit exits 1 when
    // the tree is clean, which is fine).
    const cwd = process.cwd();
    const command = [
      `git -C "${cwd}" add content/`,
      `git -C "${cwd}" add public/images/uploads/ 2>/dev/null || true`,
      `git -C "${cwd}" commit -m "Update CMS content" || true`,
      // --autostash stashes any dirty working-tree files (e.g. package-lock.json
      // from npm ci) before the rebase and restores them after, so the pull
      // never aborts due to unstaged changes on the server.
      `git -C "${cwd}" pull --rebase --autostash origin HEAD`,
      `git -C "${cwd}" push -u origin HEAD`,
    ].join(" && ");

    const { stdout, stderr } = await execAsync(command);

    return NextResponse.json({
      message: "Sync successful.",
      stdout,
      stderr,
    });
  } catch (error: any) {
    console.error("[Git Sync Error]", error);
    
    return NextResponse.json(
      {
        error: error.message || "Failed to execute git commands.",
        stderr: error.stderr || "",
        stdout: error.stdout || "",
      },
      { status: 500 }
    );
  }
}
