"use client";

import { usePathname, useRouter } from "next/navigation";
import { useWebHaptics } from "web-haptics/react";
import {
    BadgeCheck,
    Briefcase,
    ScrollText,
    GraduationCap,
    Library,
    CircleHelp,
    CircleUserRound,
} from "lucide-react";
import {
    Dock,
    DockIcon,
    DockItem,
    DockLabel,
} from "@/components/motion-primitives/dock";
import { cn } from "@/lib/utils";

const dockItems = [
    {
        title: "Verifications",
        icon: BadgeCheck,
        href: "/toolbox/verifications",
    },
    {
        title: "Opportunities",
        icon: Briefcase,
        href: "/toolbox/external-opportunities",
    },
    {
        title: "View Requests",
        icon: ScrollText,
        href: "/toolbox/view-requests",
    },
    {
        title: "Major/Minor",
        icon: GraduationCap,
        href: "/toolbox/major-minor-change",
    },
    {
        title: "Resources",
        icon: Library,
        href: "/toolbox/resources",
    },
    {
        title: "FAQs",
        icon: CircleHelp,
        href: "/toolbox/faqs",
    },
    {
        title: "Profile",
        icon: CircleUserRound,
        href: "/toolbox/profile",
    },
];

export function ToolboxDock() {
    const pathname = usePathname();
    const router = useRouter();
    const { trigger: triggerHaptic } = useWebHaptics();

    const handleNavigate = (href: string) => {
        // Trigger a light selection haptic on mobile
        triggerHaptic?.("selection");
        router.push(href);
    };

    return (
        <Dock
            className="border border-border/50 shadow-lg shadow-black/10 backdrop-blur-xl bg-background/80"
            panelHeight={64}
            magnification={72}
            distance={140}
        >
            {dockItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                    <DockItem
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        className="cursor-pointer"
                    >
                        <DockLabel>{item.title}</DockLabel>
                        <DockIcon>
                            <div
                                className={cn(
                                    "flex items-center justify-center rounded-xl transition-all duration-200",
                                    "w-full h-full",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                            </div>
                        </DockIcon>
                    </DockItem>
                );
            })}
        </Dock>
    );
}
