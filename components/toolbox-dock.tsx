"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const dockItems = [
    {
        title: "POC",
        icon: <Users className="h-full w-full" />,
        href: "/duperset/pocs",
    },
    {
        title: "Verifications",
        icon: <BadgeCheck className="h-full w-full" />,
        href: "/duperset/verifications",
    },
    {
        title: "External Opportunities",
        icon: <Briefcase className="h-full w-full" />,
        href: "/duperset/external-opportunities",
    },
    {
        title: "Requests",
        icon: <ScrollText className="h-full w-full" />,
        href: "/duperset/view-requests",
    },
    {
        title: "Academic",
        icon: <GraduationCap className="h-full w-full" />,
        href: "/duperset/major-minor-change",
    },
    {
        title: "Resources",
        icon: <Library className="h-full w-full" />,
        href: "/duperset/resources",
    },
    {
        title: "FAQs",
        icon: <CircleHelp className="h-full w-full" />,
        href: "/duperset/faqs",
    },
    {
        title: "Profile",
        icon: <CircleUserRound className="h-full w-full" />,
        href: "/duperset/profile",
    },
];

export function ToolboxDock() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const haptic = useWebHaptics();

    const visibleItems = session?.user?.isPoc
        ? dockItems
        : dockItems.filter(item => item.href !== "/duperset/pocs");

    const links = visibleItems.map(item => {
        let icon = item.icon;
        if (item.title === "Profile" && session?.user) {
            const initials = session.user.name
                ? session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "AU";
            icon = (
                <Avatar className="!h-full !w-full border-none">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold h-full w-full flex items-center justify-center rounded-full">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            );
        }
        return {
            ...item,
            icon,
            isActive: pathname === item.href,
            onNavigate: () => haptic.trigger("selection"),
        };
    });

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
