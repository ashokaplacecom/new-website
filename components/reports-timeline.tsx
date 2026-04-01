"use client";

import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface ReportEntry {
  id: string;
  month: string;
  oneLiner: string;
  pdfEmbedUrl: string;
}

interface ReportsTimelineProps {
  entries: ReportEntry[];
}

export function ReportsTimeline({ entries }: ReportsTimelineProps) {
  const data = entries.map((entry) => ({
    title: entry.month,
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
          {entry.oneLiner}
        </p>
        
        <div className="flex justify-start">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-xl">
                <BookOpen className="h-4 w-4" />
                Reading Mode
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-none w-full sm:w-[95vw] sm:max-w-5xl h-[100dvh] sm:h-[95vh] p-0 pt-12 sm:pt-12 overflow-hidden flex flex-col rounded-none sm:rounded-2xl border-0 sm:border bg-background">
              <div className="sr-only">
                <DialogTitle>Reading Mode</DialogTitle>
                <DialogDescription>Enlarged PDF view for {entry.month}</DialogDescription>
              </div>
              <div className="flex-1 w-full h-full p-0 sm:p-2 md:p-6 bg-muted/20 pb-5 sm:pb-0">
                <iframe 
                  src={entry.pdfEmbedUrl} 
                  className="w-full h-full sm:rounded-lg shadow-md border-0 sm:border sm:border-border bg-background"
                  allow="autoplay"
                ></iframe>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full aspect-[4/3] max-w-2xl rounded-xl overflow-hidden border border-border shadow-sm">
          <iframe 
            src={entry.pdfEmbedUrl} 
            className="w-full h-full bg-muted/10 pointer-events-none"
            allow="autoplay"
            tabIndex={-1}
          ></iframe>
        </div>
      </div>
    ),
  }));

  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} title="Monthly Reports" description="Dive into our monthly recaps and placement data. Each month brings insights into our placement metrics and corporate networking events." />
    </div>
  );
}
