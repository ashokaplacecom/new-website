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

            {/* Bottom Dock */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <ToolboxDock />
                </div>
            </div>
        </div>
    );
}
