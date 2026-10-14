'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function DocxViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocx() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load document (${res.status})`);
        const blob = await res.blob();

        if (cancelled) return;

        const { renderAsync } = await import('docx-preview');
        if (containerRef.current && !cancelled) {
          containerRef.current.innerHTML = '';
          await renderAsync(blob, containerRef.current, undefined, {
            className: 'docx-document',
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('[DocxViewer] Error:', err);
          setError(err?.message || 'Failed to render document preview.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocx();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-muted/30 flex justify-center min-h-[70vh]">
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm font-medium">Rendering document preview...</span>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2 text-sm text-center max-w-md">
          <span className="font-semibold">Unable to preview document directly.</span>
          <span className="text-muted-foreground text-xs">{error}</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full max-w-4xl bg-white text-black p-6 sm:p-12 rounded-2xl shadow-sm min-h-[70vh] border border-border/60 ${
          loading || error ? 'hidden' : 'block'
        }`}
      />
    </div>
  );
}
