import type { LucideIcon } from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";


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
        <div className="container max-w-4xl py-12 px-4 mx-auto">
            <div className="flex flex-col gap-1 mb-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <TextAnimate animation="slideUp" by="character" className="text-3xl font-bold tracking-tight text-foreground">
                            {title}
                        </TextAnimate>
                        <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">{description}</p>
                    </div>
                </div>
            </div>
            <div className="relative">
                {children ? (
                    children
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm py-32 gap-4 text-center shadow-sm">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 text-muted-foreground mb-2 border border-border/50">
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-foreground/90">Coming soon</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                This tool is currently under development. Stay tuned for updates!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
