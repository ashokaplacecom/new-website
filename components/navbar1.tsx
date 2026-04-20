"use client";

import { Users, ChartLine, Menu, Presentation, LogIn } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
  disabled?: boolean;
  tooltip?: string;
  requiresAuth?: boolean;
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
}

const Navbar1 = ({
  logo = {
    url: "https://www.ashoka-place.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "Connect Placecom",
  },
  menu = [
    { title: "Home", url: "/" },
    {
      title: "About",
      url: "/about",
      items: [
        {
          title: "The Team",
          url: "/about/team",
          icon: <Users className="size-5 shrink-0" />,
          description: "Something about the team",
        },
        {
          title: "Progress Reports",
          url: "/about/reports",
          icon: <ChartLine className="size-5 shrink-0" />,
          description: "Something about progress reports",
        },
      ],
    },
    {
      title: "Podcast",
      url: "/podcast",
    },
    {
      title: "Newsletter",
      url: "/newsletter",
      disabled: true,
      tooltip: "Coming soon",
    },
    {
      title: "List an Opportunity",
      url: "/submit-opportunity",
      requiresAuth: true,
      tooltip: "Sign in with your @ashoka.edu.in account to access this!",
      description: "Share an opportunity with us to provide to Ashokan students!",
    },
    {
      title: "Contact Us",
      url: "/contact",
    },
  ],
  className,
}: Navbar1Props) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <section className={cn("py-4", className)}>
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) =>
                    renderMenuItem(item, isAuthenticated)
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right-side auth controls */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              // Skeleton placeholder while session loads
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && session ? (
              <>
                <Button
                  size="sm"
                  className="bg-primary/5 hover:bg-primary/10 text-primary/80 border-primary/20 border shadow-sm"
                  asChild
                >
                  <Link href="/toolbox">Toolbox</Link>
                </Button>
                <UserNav session={session} />
              </>
            ) : (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => signIn("google", { callbackUrl: "/toolbox" })}
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
            </a>

            <div className="flex items-center gap-2">
              {/* Mobile: show avatar outside sheet if logged in */}
              {!isLoading && isAuthenticated && session && (
                <UserNav session={session} />
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-2">
                        <img
                          src={logo.src}
                          className="max-h-8 dark:invert"
                          alt={logo.alt}
                        />
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) =>
                        renderMobileMenuItem(item, isAuthenticated)
                      )}
                    </Accordion>

                    <div className="flex flex-col gap-3">
                      {isAuthenticated ? (
                        <Button
                          className="bg-primary/5 text-primary/80 border-primary/20 border shadow-sm"
                          asChild
                        >
                          <Link href="/toolbox">Enter Toolbox</Link>
                        </Button>
                      ) : (
                        <Button
                          className="gap-2"
                          onClick={() =>
                            signIn("google", { callbackUrl: "/toolbox" })
                          }
                        >
                          <LogIn className="h-4 w-4" />
                          Sign in with Google
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem, isAuthenticated: boolean) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  // Items that require auth: treat as disabled when not signed in
  const isDisabled = item.disabled || (item.requiresAuth && !isAuthenticated);
  const tooltip =
    item.tooltip ??
    (item.requiresAuth && !isAuthenticated
      ? "Sign in with your @ashoka.edu.in account to access this!"
      : undefined);

  const link = (
    <NavigationMenuLink
      href={isDisabled ? undefined : item.url}
      className={cn(
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
    >
      {item.title}
    </NavigationMenuLink>
  );

  if (tooltip) {
    return (
      <NavigationMenuItem key={item.title}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </NavigationMenuItem>
    );
  }

  return <NavigationMenuItem key={item.title}>{link}</NavigationMenuItem>;
};

const renderMobileMenuItem = (item: MenuItem, isAuthenticated: boolean) => {
  const isDisabled = item.disabled || (item.requiresAuth && !isAuthenticated);
  const tooltip =
    item.tooltip ??
    (item.requiresAuth && !isAuthenticated
      ? "Sign in with your @ashoka.edu.in account to access this!"
      : undefined);

  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  const link = (
    <a
      key={item.title}
      href={isDisabled ? undefined : item.url}
      className={cn(
        "text-md font-semibold",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
    >
      {item.title}
    </a>
  );

  if (tooltip) {
    return (
      <Tooltip key={item.title}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar1 };
