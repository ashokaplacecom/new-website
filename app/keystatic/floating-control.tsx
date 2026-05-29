"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, GitBranch } from "lucide-react";
import { toast } from "sonner";

export default function KeystaticFloatingControl() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Syncing content with GitHub...");

    try {
      const res = await fetch("/api/backend/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sync changes.");
      }

      toast.success("Synchronized successfully!", {
        id: toastId,
        description: "Local edits and uploads are pushed to production.",
      });
    } catch (err: any) {
      console.error("[CMS Floating Sync Error]", err);
      toast.error("Synchronization failed", {
        id: toastId,
        description: err.message || "An unknown error occurred.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-2 bg-white/90 border border-gray-200/80 shadow-2xl rounded-full px-4 py-2 backdrop-blur-md animate-fade-in font-sans">
      
      {/* Back Button */}
      <Link
        href="/backend"
        className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all text-xs font-semibold group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Dashboard
      </Link>

      {/* Vertical Divider */}
      <div className="h-4 w-px bg-gray-200" />

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all text-xs font-semibold disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync Changes"}
      </button>
    </div>
  );
}
