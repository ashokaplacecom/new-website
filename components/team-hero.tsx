"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";
import { TypingAnimation } from "@/components/ui/typing-animation";
import type { TeamHeroSection } from "@/lib/content-types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TeamHeroProps {
    section: TeamHeroSection;
}

/**
 * Full-viewport hero for the Team page.
 * Mirrors the AboutHero visual pattern: parallax background, dark overlay,
 * grain texture, TextAnimate heading, TypingAnimation subheading, fade scroll indicator.
 *
 * Uses next/image with `fill` + `priority` for the background photo so the image
 * is served as an optimised WebP/AVIF with automatic cache headers.
 */
export function TeamHero({ section }: TeamHeroProps) {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section
            ref={containerRef}
            className={cn(
                "relative min-h-[92vh] flex items-center justify-center overflow-hidden",
                section.className
            )}
            aria-label="Team hero"
        >
            {/* ── Background ────────────────────────────────────────────────── */}
            <motion.div
                className="absolute inset-0 -z-10"
                style={{ y: bgY }}
            >
                {section.backgroundImage ? (
                    <Image
                        src={section.backgroundImage}
                        alt="PlaceCom team photo"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                        quality={85}
                    />
                ) : (
                    /* Placeholder gradient — replace with real team photo */
                    <div className="w-full h-full bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80" />
                )}
            </motion.div>

            {/* ── Overlay ───────────────────────────────────────────────────── */}
            <div className="absolute inset-0 -z-10 bg-black/55 backdrop-blur-[1px]" />

            {/* ── Subtle grain texture ──────────────────────────────────────── */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.04]"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                }}
            />

            {/* ── Content ───────────────────────────────────────────────────── */}
            <motion.div
                className="relative z-10 text-center px-4 max-w-4xl mx-auto"
                style={{ y: contentY, opacity }}
            >
                {/* Eyebrow label */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-6"
                >
                    <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-white/60 border border-white/20 rounded-sm px-4 py-2">
                        Ashoka University — Placement Committee
                    </span>
                </motion.div>

                {/* Main heading */}
                <TextAnimate
                    animation="blurInUp"
                    by="word"
                    duration={0.7}
                    as="h1"
                    className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
                >
                    {section.heading}
                </TextAnimate>

                {/* Subheading */}
                {section.subheading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="mb-10"
                    >
                        <TypingAnimation
                            className="text-lg md:text-xl text-white/80 font-sans font-normal leading-relaxed"
                            duration={30}
                            delay={800}
                            showCursor={false}
                        >
                            {section.subheading}
                        </TypingAnimation>
                    </motion.div>
                )}
            </motion.div>

            {/* ── Scroll indicator ──────────────────────────────────────────── */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.6 }}
                style={{ opacity }}
            >
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="size-5" />
                </motion.div>
            </motion.div>
        </section>
    );
}
