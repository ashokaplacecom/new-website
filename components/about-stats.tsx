"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Marquee } from "@/components/ui/marquee";
import type { AboutStatsSection } from "@/lib/content-types";
import { cn } from "@/lib/utils";

// ── Company logos for the marquee ─────────────────────────────────────────────
// These are placeholder text-based logos until real SVGs/images are provided.
// Replace items in `COMPANY_LOGOS` with actual logo <img> tags or SVG components.

interface CompanyLogo {
    name: string;
    /** Optional logo src — omit to use text fallback */
    src?: string;
}

const COMPANY_LOGOS: CompanyLogo[] = [
    { name: "McKinsey & Company" },
    { name: "Bain & Company" },
    { name: "Boston Consulting Group" },
    { name: "Goldman Sachs" },
    { name: "JP Morgan" },
    { name: "Deloitte" },
    { name: "KPMG" },
    { name: "EY" },
    { name: "Teach For India" },
    { name: "Unilever" },
    { name: "Procter & Gamble" },
    { name: "Microsoft" },
    { name: "Google" },
    { name: "Amazon" },
    { name: "Zomato" },
    { name: "Swiggy" },
];

function LogoCard({ logo }: { logo: CompanyLogo }) {
    return (
        <div className="flex items-center justify-center px-6 py-3 min-w-max">
            {logo.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-7 object-contain opacity-50 hover:opacity-80 transition-opacity grayscale"
                />
            ) : (
                <span className="text-sm font-medium tracking-wide text-muted-foreground/60 hover:text-muted-foreground transition-colors whitespace-nowrap select-none">
                    {logo.name}
                </span>
            )}
        </div>
    );
}

interface AboutStatsProps {
    section: AboutStatsSection;
}

/**
 * Animated stats section for the About page.
 * - NumberTicker counts up when scrolled into view
 * - Staggered card reveal via Framer Motion
 * - Company logos marquee below the stats
 */
export function AboutStats({ section }: AboutStatsProps) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const cols = section.columns ?? Math.min(section.items.length, 4);

    return (
        <section
            ref={ref}
            className={cn("py-20 px-4", section.className)}
            id="metrics"
            aria-label="PlaceCom metrics"
        >
            <div className="max-w-5xl mx-auto">
                {/* Section heading */}
                {section.heading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center mb-4"
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                            {section.heading}
                        </h2>
                    </motion.div>
                )}

                {/* Subheading */}
                {section.subheading && (
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-center text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-14"
                    >
                        {section.subheading}
                    </motion.p>
                )}

                {/* Stats grid — 2-col on mobile, dynamic cols on lg */}
                <div
                    className={cn(
                        "grid grid-cols-2 gap-4 sm:gap-6",
                        cols === 4 && "lg:grid-cols-4",
                        cols === 3 && "lg:grid-cols-3",
                        cols === 2 && "lg:grid-cols-2",
                    )}
                >
                    {section.items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 28, scale: 0.97 }}
                            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                            transition={{
                                duration: 0.55,
                                delay: 0.15 + i * 0.08,
                                ease: [0.25, 0.1, 0.25, 1],
                            }}
                            className="group relative flex flex-col items-center p-6 md:p-8 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                        >
                            {/* Subtle hover gradient */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/0 to-primary/0 group-hover:from-primary/[0.03] group-hover:to-primary/[0.06] transition-all duration-300 pointer-events-none" />

                            {/* Number */}
                            <div className="flex items-baseline gap-0.5 mb-2">
                                {item.prefix && (
                                    <span className="text-2xl md:text-3xl font-bold text-primary font-mono">
                                        {item.prefix}
                                    </span>
                                )}
                                {isInView && (
                                    <NumberTicker
                                        value={item.value}
                                        className="text-4xl md:text-5xl font-bold text-primary font-mono tabular-nums"
                                    />
                                )}
                                {item.suffix && (
                                    <span className="text-2xl md:text-3xl font-bold text-primary font-mono">
                                        {item.suffix}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span className="text-xs md:text-sm text-muted-foreground text-center leading-snug mt-1 font-medium tracking-wide uppercase">
                                {item.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Recruiter logos marquee ────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-20"
            >
                <p className="text-center text-xs tracking-[0.2em] uppercase text-muted-foreground/50 mb-8 font-medium">
                    Recruiting partners across sectors
                </p>
                <div className="relative">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

                    <Marquee
                        pauseOnHover
                        className="[--duration:35s] [--gap:0rem]"
                        repeat={3}
                    >
                        {COMPANY_LOGOS.map((logo) => (
                            <LogoCard key={logo.name} logo={logo} />
                        ))}
                    </Marquee>
                </div>
            </motion.div>
        </section>
    );
}
