"use client";

import { ToolboxDock } from "@/components/toolbox-dock";

export default function ToolboxLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
            {/* Page content - padded at bottom for dock */}
            <main className="flex-1 pb-32">{children}</main>

            <ToolboxDock />
        </div>
    );
}
