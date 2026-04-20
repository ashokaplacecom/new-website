"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, LayoutGroup } from "motion/react";
import { useWebHaptics } from "web-haptics/react";
import {
    BadgeCheck,
    Briefcase,
    ScrollText,
    GraduationCap,
    Library,
    CircleHelp,
    CircleUserRound,
    Users,
} from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";

const dockItems = [
    {
        title: "POC",
        icon: <Users className="h-full w-full" />,
        href: "/toolbox/pocs",
    },
    {
        title: "Verifications",
        icon: <BadgeCheck className="h-full w-full" />,
        href: "/toolbox/verifications",
    },
    {
        title: "External Opportunities",
        icon: <Briefcase className="h-full w-full" />,
        href: "/toolbox/external-opportunities",
    },
    {
        title: "Requests",
        icon: <ScrollText className="h-full w-full" />,
        href: "/toolbox/view-requests",
    },
    {
        title: "Academic",
        icon: <GraduationCap className="h-full w-full" />,
        href: "/toolbox/major-minor-change",
    },
    {
        title: "Resources",
        icon: <Library className="h-full w-full" />,
        href: "/toolbox/resources",
    },
    {
        title: "FAQs",
        icon: <CircleHelp className="h-full w-full" />,
        href: "/toolbox/faqs",
    },
    {
        title: "Profile",
        icon: <CircleUserRound className="h-full w-full" />,
        href: "/toolbox/profile",
    },
];

export function ToolboxDock() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const visibleItems = session?.user?.isPoc
        ? dockItems
        : dockItems.filter(item => item.href !== "/toolbox/pocs");

    const links = visibleItems.map(item => ({
        ...item,
        isActive: pathname === item.href
    }));

    return (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto">
                <FloatingDock
                    items={links}
                    desktopClassName="shadow-2xl"
                    mobileClassName="translate-y-[-2rem]"
                />
            </div>
        </div>
    );
}
