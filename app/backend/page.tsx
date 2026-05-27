"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, RefreshCw, CheckCircle, AlertCircle, ArrowRight, GitCommit } from "lucide-react";

export default function BackendDashboard() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setOutput("");
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/backend/sync", {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "An unknown error occurred.");
      } else {
        setSuccess(true);
      }
      
      if (data.stdout) {
        setOutput(data.stdout + (data.stderr ? "\n" + data.stderr : ""));
      } else if (data.message) {
        setOutput(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            PlaceCom Portal Control Panel
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Welcome to the administration dashboard. Manage page content and synchronize local modifications with the production environment.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Card 1: CMS Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Edit className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">CMS Editor</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Launch the Keystatic Admin Panel to write new articles, edit pages (Home, About, Podcast), update Recruiting Partners, and manage other structured website collections.
              </p>
            </div>
            <div>
              <Link 
                href="/keystatic"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl font-medium text-sm transition-colors duration-150 gap-2 group"
              >
                Launch CMS Editor
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Git Sync */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <GitCommit className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Synchronize Content</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Commit your local changes and push them directly to GitHub. This triggers the automated deployment pipeline to update the live website.
              </p>
            </div>
            <div>
              <button
                onClick={handleSync}
                disabled={loading}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-colors duration-150 gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Push Edits to GitHub
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Sync Logs and Outputs */}
        {(loading || success || error || output) && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider">
              Operation Logs
            </h3>

            {/* Success state */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Synchronization Successful</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Your local changes have been successfully committed and pushed to GitHub. The live build will begin updating.
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Synchronization Failed</h4>
                  <p className="text-xs text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Raw Terminal Output */}
            {output && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500">Terminal Log Output:</div>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono max-h-60 leading-relaxed">
                  {output}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
