"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "motion/react";
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

    return (
        <LayoutGroup>
            <Dock
                className={cn(
                    "border border-white/30 dark:border-white/15",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.4)]",
                    "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]",
                    "backdrop-blur-2xl backdrop-saturate-[1.8]",
                    "bg-white/50 dark:bg-neutral-900/50",
                    "ring-1 ring-white/20 dark:ring-white/5"
                )}
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
                            className="cursor-pointer"
                        >
                            <Link href={item.href} className="absolute inset-0 z-10" aria-label={item.title} />
                            <DockLabel>{item.title}</DockLabel>
                            <DockIcon>
                                <div
                                    className={cn(
                                        "relative flex items-center justify-center rounded-full transition-colors duration-200",
                                        "aspect-square w-full p-2",
                                        isActive
                                            ? "text-primary-foreground"
                                            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="toolbox-active-indicator"
                                            className="absolute inset-0 rounded-full bg-primary shadow-sm"
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <Icon className="w-5 h-5 shrink-0 relative z-[1]" />
                                </div>
                            </DockIcon>
                        </DockItem>
                    );
                })}
            </Dock>
        </LayoutGroup>
    );
}
