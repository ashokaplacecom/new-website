"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Database } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Update Students", url: "/admin/students", icon: Users },
  { title: "View Database", url: "/admin/database", icon: Database },
];

export function AppSidebar() {
  const currentPath = usePathname();
  const { data: session } = useSession();
  
  const isActive = (p: string) => currentPath === p;
  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-chart-5 shadow-sm" />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">Admin Console</span>
            <span className="text-[11px] text-muted-foreground">Operations</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-3">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5 flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-7 w-7 rounded-lg ring-1 ring-border/50">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user.name || "User Avatar"} className="rounded-lg object-cover" />
            ) : null}
            <AvatarFallback className="rounded-lg text-[10px] font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
              {user?.name || "Admin User"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[140px] mt-0.5">
              {user?.email || "admin@ashoka.edu.in"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
