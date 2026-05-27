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
    // We navigate to the content folder to add changes, commit them and push.
    // Ensure you are pushing to the branch that CI/CD tracks.
    // If the working tree is clean, git commit will throw an error, which we catch.
    const command = `git add content/ && (git add public/images/uploads/ 2>/dev/null || true) && (git diff-index --quiet HEAD || git commit -m "Update CMS content" && git push)`;

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
