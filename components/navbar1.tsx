"use client";

import { Users, ChartLine, Menu, Presentation, LogIn } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NoiseBackground } from "@/components/ui/noise-background";
import { TextAnimate } from "@/components/ui/text-animate";



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
    url: "/",
    src: "/placecom_logo.png",
    alt: "PlaceCom Logo",
    title: "Connect Placecom",
  },
  menu = [
    { title: "Home", url: "/" },
    {
      title: "About",
      url: "/about",
    },
    {
      title: "Podcast",
      url: "/podcast",
    },
    {
      title: "Newsletter",
      url: "/newsletter",
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
  const pathname = usePathname();
  const isInDuperset = pathname?.startsWith("/duperset") || pathname?.startsWith("/duperset");

  return (
    <section className={cn("sticky top-0 z-50 w-full border-b border-border bg-background py-4", className)}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8"
                alt={logo.alt}
              />
              <TextAnimate animation="blurIn" by="character" className="text-lg font-bold tracking-tighter bg-clip-text text-black bg-gradient-to-r from-primary to-primary/60">
                {logo.title}
              </TextAnimate>
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
                {!isInDuperset && (
                  <Link href="/duperset">
                    <NoiseBackground
                      containerClassName="h-9 rounded-full p-0 px-5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 cursor-pointer border border-primary-foreground/10 bg-primary dark:bg-primary group hover:scale-[1.02] active:scale-[0.98]"
                      className="flex h-full items-center justify-center"
                      gradientColors={["var(--chart-1)", "var(--chart-2)", "var(--chart-5)"]}
                      noiseIntensity={0.15}
                    >
                      <span className="text-sm font-bold tracking-tight text-primary-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                        Duperset
                      </span>
                    </NoiseBackground>
                  </Link>
                )}

                <UserNav session={session} />
              </>
            ) : (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => signIn("google", { callbackUrl: "/duperset" })}
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
                className="max-h-8"
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
                          className="max-h-8"
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

                    {(!isAuthenticated || !isInDuperset) && (
                      <div className="flex flex-col gap-3">
                        {isAuthenticated ? (
                          <Link href="/duperset">
                            <NoiseBackground
                              containerClassName="h-11 rounded-full p-0 px-6 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 cursor-pointer border border-primary-foreground/10 bg-primary dark:bg-primary group hover:scale-[1.02] active:scale-[0.98]"
                              className="flex h-full items-center justify-center"
                              gradientColors={["var(--chart-1)", "var(--chart-2)", "var(--chart-5)"]}
                              noiseIntensity={0.15}
                            >
                              <span className="text-base font-bold tracking-tight text-primary-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                Enter Duperset
                              </span>
                            </NoiseBackground>
                          </Link>
                        ) : (
                          <Button
                            className="gap-2"
                            onClick={() =>
                              signIn("google", { callbackUrl: "/duperset" })
                            }
                          >
                            <LogIn className="h-4 w-4" />
                            Sign in with Google
                          </Button>
                        )}
                      </div>
                    )}
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
  const tooltip = item.disabled
    ? item.tooltip
    : item.requiresAuth && !isAuthenticated
      ? item.tooltip ?? "Sign in with your @ashoka.edu.in account to access this!"
      : undefined;

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
  const tooltip = item.disabled
    ? item.tooltip
    : item.requiresAuth && !isAuthenticated
      ? item.tooltip ?? "Sign in with your @ashoka.edu.in account to access this!"
      : undefined;

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
