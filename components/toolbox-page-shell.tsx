import type { LucideIcon } from "lucide-react";

interface ToolboxPageShellProps {
    icon: LucideIcon;
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function ToolboxPageShell({
    icon: Icon,
    title,
    description,
    children,
}: ToolboxPageShellProps) {
    return (
        <div className="container max-w-3xl py-10 px-4 mx-auto font-[family-name:var(--font-geist-sans)]">
            <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-8 ml-[52px]">{description}</p>
            {children ? (
                children
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/40 py-24 gap-3 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted text-muted-foreground mb-2">
                        <Icon className="w-7 h-7" />
                    </div>
                    <p className="text-base font-medium text-foreground/80">Coming soon</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        This tool is being built. Check back soon!
                    </p>
                </div>
            )}
        </div>
    );
}
