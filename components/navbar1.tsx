"use client";

import { Users, ChartLine, Menu, Presentation } from "lucide-react";
import Link from "next/link";

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

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
  disabled?: boolean;
  tooltip?: string;
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
  auth?: {
    signup: {
      title: string;
      url: string;
    };
  };
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
        {
          title: "Our Projects",
          url: "/about/projects",
          icon: <Presentation className="size-5 shrink-0" />,
          description: "Projects we've done",
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
      title: "Contact Us",
      url: "/contact",
    },
  ],
  auth = {
    signup: { title: "Enter Toolbox", url: "#" },
  },
  className,
}: Navbar1Props) => {
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
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-primary/5 hover:bg-primary/10 text-primary/80 border-primary/20 border shadow-sm disabled:opacity-100"
            >
              {/* {auth.signup.title} */}
              <Link href="/toolbox">Enter Toolbox</Link>
            </Button>
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
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <Button
                      disabled
                      className="bg-primary/5 text-primary/80 border-primary/20 border shadow-sm disabled:opacity-100"
                    >
                      {auth.signup.title}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
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

  const link = (
    <NavigationMenuLink
      href={item.disabled ? undefined : item.url}
      className={cn(
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground",
        item.disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={item.disabled ? (e) => e.preventDefault() : undefined}
    >
      {item.title}
    </NavigationMenuLink>
  );

  if (item.tooltip) {
    return (
      <NavigationMenuItem key={item.title}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent>
            <p>{item.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </NavigationMenuItem>
    );
  }

  return <NavigationMenuItem key={item.title}>{link}</NavigationMenuItem>;
};

const renderMobileMenuItem = (item: MenuItem) => {
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
      href={item.disabled ? undefined : item.url}
      className={cn(
        "text-md font-semibold",
        item.disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={item.disabled ? (e) => e.preventDefault() : undefined}
    >
      {item.title}
    </a>
  );

  if (item.tooltip) {
    return (
      <Tooltip key={item.title}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent>
          <p>{item.tooltip}</p>
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
