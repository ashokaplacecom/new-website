"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { useWebHaptics } from "web-haptics/react";
import {
    Building2,
    Calendar,
    Clock,
    Banknote,
    Tag,
    Users,
    Wrench,
    ExternalLink,
    Send,
    ChevronRight,
    Briefcase,
    X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Opportunity {
    id: string;
    name: string;
    company: string;
    role: string;
    category: "Internship" | "Full-Time" | "Research" | "Fellowship" | "Part-Time" | "Project";
    deadline: string; // ISO date string or human-readable
    compensation: string;
    duration: string;
    eligibility: string;
    skills: string[];
    jdUrl?: string;
    applyUrl?: string;
    logo?: React.ReactNode;
}

// ─── Category badge colours ───────────────────────────────────────────────────

const categoryColours: Record<Opportunity["category"], string> = {
    Internship: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Full-Time": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Research: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    Fellowship: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Part-Time": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    Project: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

// ─── Compact row field ────────────────────────────────────────────────────────

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Icon className="w-3 h-3 shrink-0 opacity-70" />
            <span className="font-medium text-foreground/50">{label}:</span>
            <span className="text-foreground/80">{value}</span>
        </div>
    );
}

// ─── Default logo placeholder ─────────────────────────────────────────────────

function DefaultLogo({ company }: { company: string }) {
    return (
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {company.charAt(0).toUpperCase()}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface OpportunityListingProps {
    opportunities: Opportunity[];
    className?: string;
}

export default function OpportunityListing({ opportunities, className }: OpportunityListingProps) {
    const [activeItem, setActiveItem] = useState<Opportunity | null>(null);
    const ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const shouldReduceMotion = useReducedMotion();
    const haptic = useWebHaptics();

    useOnClickOutside(ref, () => setActiveItem(null));

    useEffect(() => {
        function onKeyDown(event: { key: string }) {
            if (event.key === "Escape") setActiveItem(null);
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    function openItem(opp: Opportunity) {
        haptic.trigger("light");
        setActiveItem(opp);
    }

    function handleJD(url?: string) {
        haptic.trigger("medium");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    }

    function handleApply(url?: string) {
        haptic.trigger("medium");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    }

    return (
        <>
            {/* ── Backdrop ── */}
            <AnimatePresence>
                {activeItem && (
                    <motion.div
                        key="backdrop"
                        animate={{ opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                        className="pointer-events-none fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* ── Expanded Panel ── */}
            <AnimatePresence>
                {activeItem && (
                    <div className="fixed inset-0 z-50 grid place-items-center px-4">
                        <motion.div
                            layoutId={shouldReduceMotion ? undefined : `opp-${activeItem.id}`}
                            ref={ref}
                            transition={
                                shouldReduceMotion
                                    ? { duration: 0 }
                                    : { type: "spring", duration: 0.28, bounce: 0.08 }
                            }
                            style={{ borderRadius: 16, willChange: shouldReduceMotion ? "auto" : "transform" }}
                            className="w-full max-w-lg bg-card border border-border shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-5 pb-4 flex items-start gap-4 border-b border-border/60">
                                <motion.div layoutId={shouldReduceMotion ? undefined : `logo-${activeItem.id}`}>
                                    {activeItem.logo ?? <DefaultLogo company={activeItem.company} />}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-foreground text-base leading-tight">
                                            {activeItem.name}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${categoryColours[activeItem.category]}`}>
                                            {activeItem.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {activeItem.role} · {activeItem.company}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { haptic.trigger("light"); setActiveItem(null); }}
                                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-90 transition-all duration-150"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Details grid */}
                            <motion.div
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
                                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, delay: 0.06 }}
                                className="p-5 grid grid-cols-2 gap-x-4 gap-y-3"
                            >
                                <InfoRow icon={Calendar} label="Deadline" value={activeItem.deadline} />
                                <InfoRow icon={Banknote} label="Compensation" value={activeItem.compensation} />
                                <InfoRow icon={Clock} label="Duration" value={activeItem.duration} />
                                <InfoRow icon={Briefcase} label="Role" value={activeItem.role} />
                                <div className="col-span-2">
                                    <InfoRow icon={Users} label="Eligibility" value={activeItem.eligibility} />
                                </div>
                                <div className="col-span-2">
                                    <p className="flex items-start gap-2 text-xs">
                                        <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                                        <span>
                                            <span className="font-medium text-foreground/50 mr-1">Skills:</span>
                                            <span className="text-foreground/80">{activeItem.skills.join(", ")}</span>
                                        </span>
                                    </p>
                                </div>
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
                                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, delay: 0.1 }}
                                className="px-5 pb-5 flex gap-3"
                            >
                                <button
                                    onClick={() => handleJD(activeItem.jdUrl)}
                                    disabled={!activeItem.jdUrl}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/60 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View JD
                                </button>
                                <button
                                    onClick={() => handleApply(activeItem.applyUrl)}
                                    disabled={!activeItem.applyUrl}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                    Apply Now
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── List ── */}
            <div className={`flex flex-col gap-3 ${className ?? ""}`}>
                {opportunities.map((opp) => (
                    <motion.div
                        key={opp.id}
                        layoutId={shouldReduceMotion ? undefined : `opp-${opp.id}`}
                        onClick={() => openItem(opp)}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", duration: 0.25, bounce: 0.08 }}
                        style={{ borderRadius: 12, willChange: shouldReduceMotion ? "auto" : "transform" }}
                        className="group relative flex items-start gap-4 bg-card border border-border/60 hover:border-border p-4 cursor-pointer select-none hover:shadow-md transition-shadow duration-200"
                    >
                        {/* Logo */}
                        <motion.div layoutId={shouldReduceMotion ? undefined : `logo-${opp.id}`} className="mt-0.5">
                            {opp.logo ?? <DefaultLogo company={opp.company} />}
                        </motion.div>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm text-foreground">{opp.name}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${categoryColours[opp.category]}`}>
                                        {opp.category}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
                            </div>

                            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                                {opp.role} · {opp.company}
                            </p>

                            {/* Meta row */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                <MetaItem icon={Calendar} label="Deadline" value={opp.deadline} />
                                <MetaItem icon={Banknote} label="Compensation" value={opp.compensation} />
                                <span className="hidden sm:contents"><MetaItem icon={Clock} label="Duration" value={opp.duration} /></span>
                            </div>

                            {/* Skill tags */}
                            <div className="hidden sm:flex flex-wrap gap-1.5 mt-2.5">
                                {opp.skills.slice(0, 4).map((skill) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[11px] font-medium border border-border/40"
                                    >
                                        <Tag className="w-2.5 h-2.5" />
                                        {skill}
                                    </span>
                                ))}
                                {opp.skills.length > 4 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground text-[11px] border border-border/30">
                                        +{opp.skills.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <p className="flex items-start gap-2 text-xs">
            <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
            <span>
                <span className="font-medium text-foreground/50 mr-1">{label}:</span>
                <span className="text-foreground/80">{value}</span>
            </span>
        </p>
    );
}
