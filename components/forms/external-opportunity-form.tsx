"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    CalendarIcon,
    Upload,
    FileText,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Briefcase,
    RefreshCcwDot,
    HelpCircle,
    Lock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

/* ─── Types ─── */
type DeadlineMode = "date" | "rolling" | "unknown";
type JDMode = "upload" | "manual" | null;
type Step = "intro" | "upload" | "manual" | "success";

interface FormData {
    // Step 1 — Intro
    submitter_email: string;
    title: string;
    recruiting_body: string;
    deadlineMode: DeadlineMode;
    deadline: Date | undefined;
    jd_mode: JDMode;

    // Shared Step 2 fields
    jd_file: File | null;
    work_arrangement: string;
    compensation_type: string;
    duration_weeks: string;
    start_date: Date | undefined;

    // Step 2b — Manual details
    job_description: string;
    eligibility_restrictions: string;
    apply_method: string;

    // Shared last question
    placecom_notes: string;
}

const INITIAL: FormData = {
    submitter_email: "",
    title: "",
    recruiting_body: "",
    deadlineMode: "date",
    deadline: undefined,
    jd_mode: null,
    jd_file: null,
    work_arrangement: "",
    compensation_type: "",
    duration_weeks: "",
    start_date: undefined,
    job_description: "",
    eligibility_restrictions: "",
    apply_method: "",
    placecom_notes: "",
};

/* ─── Helpers ─── */
const inputClass = (hasError?: boolean) =>
    cn(
        "flex w-full rounded-xl border bg-background px-4 text-sm",
        "outline-none transition-all duration-200",
        "placeholder:text-muted-foreground/50",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        hasError && "border-destructive focus:border-destructive focus:ring-destructive/20"
    );

function FieldLabel({
    children,
    required,
    htmlFor,
}: {
    children: React.ReactNode;
    required?: boolean;
    htmlFor?: string;
}) {
    return (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {children}
            {required && <span className="text-destructive ml-1">*</span>}
        </label>
    );
}

function FieldHint({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-muted-foreground/70 mt-0.5">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive"
        >
            {message}
        </motion.p>
    );
}

/* ─── Progress bar ─── */
function ProgressBar({ step }: { step: Step }) {
    const steps: Step[] = ["intro", "upload", "success"];
    const manualSteps: Step[] = ["intro", "manual", "success"];

    const pct =
        step === "intro" ? 33
            : step === "upload" || step === "manual" ? 66
                : 100;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">
                    Step {step === "intro" ? "1" : step === "success" ? "3" : "2"} of 3
                </span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
            </div>
        </div>
    );
}

/* ─── JD Mode card ─── */
function JDModeCard({
    value,
    current,
    icon: Icon,
    title,
    hint,
    onClick,
}: {
    value: JDMode;
    current: JDMode;
    icon: React.ElementType;
    title: string;
    hint: string;
    onClick: () => void;
}) {
    const selected = current === value;
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-full text-left rounded-xl border p-4 transition-all duration-200",
                "hover:border-primary/60 hover:bg-primary/5",
                selected
                    ? "border-primary bg-primary/8 ring-2 ring-primary/20"
                    : "border-border bg-card"
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 mt-0.5",
                        selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p
                        className={cn(
                            "text-sm font-medium leading-tight",
                            selected ? "text-primary" : "text-foreground"
                        )}
                    >
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>
                </div>
            </div>
        </button>
    );
}

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export function ExternalOpportunityForm() {
    const [data, setData] = useState<FormData>(INITIAL);
    const [step, setStep] = useState<Step>("intro");
    const [calOpen, setCalOpen] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const set = (key: keyof FormData, value: unknown) =>
        setData((prev) => ({ ...prev, [key]: value }));

    /* ── Validate step 1 ── */
    const validateIntro = useCallback(() => {
        const errs: Partial<Record<keyof FormData, string>> = {};
        if (!data.submitter_email.trim()) errs.submitter_email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.submitter_email.trim()))
            errs.submitter_email = "Please enter a valid email.";
        if (!data.title.trim()) errs.title = "Opportunity title is required.";
        if (!data.recruiting_body.trim()) errs.recruiting_body = "Organisation name is required.";
        if (data.deadlineMode === "date" && !data.deadline)
            errs.deadline = "Please select a deadline date.";
        if (!data.jd_mode) errs.jd_mode = "Please choose one of the options.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [data]);

    /* ── Next / Prev ── */
    const handleNext = () => {
        if (step === "intro") {
            if (!validateIntro()) return;
            setStep(data.jd_mode === "upload" ? "upload" : "manual");
        }
    };

    const handleBack = () => {
        if (step === "upload" || step === "manual") setStep("intro");
    };

    /* ── File drag/drop ── */
    const handleFileChange = (file: File | null) => {
        if (!file) {
            set("jd_file", null);
            setErrors((prev) => ({ ...prev, jd_file: undefined }));
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, jd_file: "File size exceeds 3MB limit." }));
            set("jd_file", null);
            return;
        }

        setErrors((prev) => ({ ...prev, jd_file: undefined }));
        set("jd_file", file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFileChange(file);
    };

    /* ── Submit ── */
    const handleSubmit = useCallback(async () => {
        setApiError(null);
        const errs: Partial<Record<keyof FormData, string>> = {};

        // Shared metadata required in both modes
        if (!data.work_arrangement) errs.work_arrangement = "Select an arrangement.";
        if (!data.compensation_type) errs.compensation_type = "Select a compensation type.";
        if (!data.duration_weeks) errs.duration_weeks = "Specify the duration.";
        if (!data.start_date) errs.start_date = "Select a start date.";

        if (step === "upload") {
            if (!data.jd_file) errs.jd_file = "Please upload a JD file.";
        }
        if (step === "manual") {
            if (!data.job_description.trim()) errs.job_description = "Job description is required.";
            if (!data.eligibility_restrictions.trim()) errs.eligibility_restrictions = "Eligibility info is required.";
            if (!data.apply_method.trim()) errs.apply_method = "How should candidates apply?";
        }

        if (Object.keys(errs).length) { setErrors(errs); return; }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("submitter_email", data.submitter_email.trim());
            fd.append("title", data.title.trim());
            fd.append("recruiting_body", data.recruiting_body.trim());
            fd.append("isRolling", String(data.deadlineMode === "rolling"));

            if (data.deadlineMode === "date" && data.deadline)
                fd.append("deadline", data.deadline.toISOString());

            // Shared metadata
            fd.append("work_arrangement", data.work_arrangement);
            fd.append("compensation_type", data.compensation_type);
            fd.append("duration_weeks", data.duration_weeks);
            if (data.start_date) fd.append("start_date", data.start_date.toISOString());

            if (step === "upload" && data.jd_file) {
                fd.append("jd_file", data.jd_file);
            }

            if (step === "manual") {
                fd.append("job_description", data.job_description.trim());
                fd.append("eligibility_restrictions", data.eligibility_restrictions.trim());
                fd.append("apply_method", data.apply_method.trim());
            }

            if (data.placecom_notes.trim())
                fd.append("placecom_notes", data.placecom_notes.trim());

            const res = await fetch("/api/duperset/external-opportunities", {
                method: "POST",
                body: fd,
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setApiError(json.message ?? "Something went wrong. Please try again.");
                return;
            }
            setStep("success");
        } catch {
            setApiError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [data, step]);

    /* ── Slide variants ── */
    const variants = {
        enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: -dir * 40, opacity: 0 }),
    };
    const dir = step === "intro" ? -1 : 1;

    return (
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* ── Left: Hero copy ── */}
                <div className="flex flex-col gap-8 lg:sticky lg:top-24">
                    <div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-5">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
                            External Opportunity
                            <br />
                            <span className="text-primary">Registration Form</span>
                        </h1>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                            Placement Committee invites faculty, departments, students, and
                            external organizations to submit openings for internships, research
                            &amp; other projects, campus jobs, and full-time roles for the
                            Ashokan community.
                        </p>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-md mt-4">
                            We've built this platform to ensure that valuable opportunities
                            reach and empower Ashoka students — helping them explore career
                            paths, gain real-world experience, and grow professionally.
                        </p>
                    </div>

                    {/* Info tiles */}
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: RefreshCcwDot, label: "Reviewed within 2–3 business days" },
                            { icon: Lock, label: "Internal notes are confidential to PlaceCom" },
                            { icon: HelpCircle, label: "Reach us at placecom@ashoka.edu.in for queries" },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0">
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Multi-step form card ── */}
                <div className={cn(
                    "relative overflow-hidden rounded-2xl border bg-card",
                    "shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]"
                )}>
                    <div className="p-6 md:p-8">
                        <AnimatePresence mode="wait" custom={dir}>
                            {step === "success" ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                    className="flex flex-col items-center justify-center py-14 gap-5 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                                    >
                                        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="space-y-2"
                                    >
                                        <h2 className="text-xl font-semibold text-foreground">Opportunity submitted!</h2>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Thank you. PlaceCom will review your submission and
                                            publish it for the Ashokan community shortly.
                                        </p>
                                    </motion.div>
                                    <button
                                        onClick={() => { setData(INITIAL); setStep("intro"); setErrors({}); }}
                                        className="mt-2 text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                                    >
                                        Submit another opportunity
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={step}
                                    custom={dir}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                    className="space-y-6"
                                >
                                    {/* Progress */}
                                    <ProgressBar step={step} />

                                    {/* ══ STEP 1: Intro ══ */}
                                    {step === "intro" && (
                                        <>
                                            <div className="mb-1">
                                                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                                                    Basic Information
                                                </h2>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    Tell us about you and the opportunity.
                                                </p>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-email" required>
                                                    Your email address
                                                </FieldLabel>
                                                <input
                                                    id="opp-email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    value={data.submitter_email}
                                                    onChange={(e) => set("submitter_email", e.target.value)}
                                                    className={cn(inputClass(!!errors.submitter_email), "h-11")}
                                                />
                                                <FieldError message={errors.submitter_email} />
                                            </div>

                                            {/* Opportunity Title */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-title" required>
                                                    Opportunity title
                                                </FieldLabel>
                                                <FieldHint>
                                                    A clear, concise title for the role or opportunity (e.g., "Summer Research Intern — Economics Lab").
                                                </FieldHint>
                                                <input
                                                    id="opp-title"
                                                    type="text"
                                                    placeholder="e.g. Data Analyst Intern"
                                                    value={data.title}
                                                    onChange={(e) => set("title", e.target.value)}
                                                    className={cn(inputClass(!!errors.title), "h-11")}
                                                />
                                                <FieldError message={errors.title} />
                                            </div>

                                            {/* Organisation */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-org" required>
                                                    Name of organisation
                                                </FieldLabel>
                                                <FieldHint>
                                                    The company, institution, lab, or department offering the opportunity.
                                                </FieldHint>
                                                <input
                                                    id="opp-org"
                                                    type="text"
                                                    placeholder="e.g. Ashoka University, McKinsey & Co."
                                                    value={data.recruiting_body}
                                                    onChange={(e) => set("recruiting_body", e.target.value)}
                                                    className={cn(inputClass(!!errors.recruiting_body), "h-11")}
                                                />
                                                <FieldError message={errors.recruiting_body} />
                                            </div>

                                            {/* Deadline */}
                                            <div className="space-y-2">
                                                <FieldLabel required>Deadline to apply</FieldLabel>

                                                {/* Deadline mode pills */}
                                                <div className="flex gap-2 flex-wrap">
                                                    {(["date", "rolling", "unknown"] as DeadlineMode[]).map((mode) => (
                                                        <button
                                                            key={mode}
                                                            type="button"
                                                            onClick={() => set("deadlineMode", mode)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                                                                data.deadlineMode === mode
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                                            )}
                                                        >
                                                            {mode === "date" && "Select a date"}
                                                            {mode === "rolling" && "Rolling deadline"}
                                                            {mode === "unknown" && "Unknown / TBD"}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Date picker (only when mode is "date") */}
                                                <AnimatePresence>
                                                    {data.deadlineMode === "date" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <Popover open={calOpen} onOpenChange={setCalOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <button
                                                                        type="button"
                                                                        id="opp-deadline"
                                                                        className={cn(
                                                                            inputClass(!!errors.deadline),
                                                                            "h-11 flex items-center gap-2 text-left w-full mt-1",
                                                                            !data.deadline && "text-muted-foreground/50"
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                                                                        {data.deadline
                                                                            ? format(data.deadline, "PPP")
                                                                            : "Pick a date"}
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={data.deadline}
                                                                        onSelect={(d) => {
                                                                            set("deadline", d);
                                                                            setCalOpen(false);
                                                                        }}
                                                                        disabled={(d) => d < new Date()}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {data.deadlineMode === "rolling" && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                                                    >
                                                        <RefreshCcwDot className="w-3.5 h-3.5 text-primary" />
                                                        Applications are reviewed on a rolling basis.
                                                    </motion.p>
                                                )}
                                                {data.deadlineMode === "unknown" && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                                                    >
                                                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                                        Deadline will be added later by PlaceCom if confirmed.
                                                    </motion.p>
                                                )}
                                                <FieldError message={errors.deadline} />
                                            </div>

                                            {/* JD Mode */}
                                            <div className="space-y-2">
                                                <FieldLabel required>
                                                    Do you have a Job Description (JD) document?
                                                </FieldLabel>
                                                <div className="flex flex-col gap-2">
                                                    <JDModeCard
                                                        value="upload"
                                                        current={data.jd_mode}
                                                        icon={Upload}
                                                        title="I have a Job Description (JD) document to upload"
                                                        hint="You'll be asked to upload the file in the next step."
                                                        onClick={() => set("jd_mode", "upload")}
                                                    />
                                                    <JDModeCard
                                                        value="manual"
                                                        current={data.jd_mode}
                                                        icon={FileText}
                                                        title="I don't have a document. I will fill in the details manually"
                                                        hint="You'll be asked to answer a few questions about the opportunity."
                                                        onClick={() => set("jd_mode", "manual")}
                                                    />
                                                </div>
                                                <FieldError message={errors.jd_mode} />
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                                className="w-full h-11 rounded-xl text-sm font-semibold"
                                            >
                                                Continue
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </>
                                    )}

                                    {/* ══ STEP 2a: JD Upload ══ */}
                                    {step === "upload" && (
                                        <>
                                            <div className="mb-1">
                                                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                                                    Upload Job Description
                                                </h2>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    Upload the JD document and provide key details.
                                                </p>
                                            </div>

                                            {/* File upload */}
                                            <div className="space-y-1.5">
                                                <FieldLabel required>Job Description file</FieldLabel>
                                                <FieldHint>Accepted formats: PDF, DOCX, DOC. Max 3 MB.</FieldHint>
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                                    onDragLeave={() => setDragActive(false)}
                                                    onDrop={handleDrop}
                                                    className={cn(
                                                        "relative mt-1 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
                                                        "p-8 text-center transition-all duration-200 cursor-pointer",
                                                        dragActive
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
                                                        errors.jd_file && "border-destructive"
                                                    )}
                                                    onClick={() => document.getElementById("jd-file-input")?.click()}
                                                >
                                                    <input
                                                        id="jd-file-input"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            handleFileChange(file);
                                                        }}
                                                    />
                                                    {data.jd_file ? (
                                                        <>
                                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                                                                <FileText className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {data.jd_file.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {(data.jd_file.size / 1024 / 1024).toFixed(2)} MB — click to change
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted">
                                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">
                                                                    Drag &amp; drop or click to upload
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, DOC — up to 3 MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <FieldError message={errors.jd_file} />
                                            </div>

                                            {/* Work Arrangement */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-work-arrangement" required>Work Arrangement</FieldLabel>
                                                <FieldHint>Select the primary work location/setup for this opportunity.</FieldHint>
                                                <select
                                                    id="opp-work-arrangement"
                                                    value={data.work_arrangement}
                                                    onChange={(e) => set("work_arrangement", e.target.value)}
                                                    className={cn(inputClass(!!errors.work_arrangement), "h-11 cursor-pointer")}
                                                >
                                                    <option value="">Select an arrangement…</option>
                                                    <option value="Remote / Work from Home">Remote / Work from Home</option>
                                                    <option value="On-site / In-person">On-site / In-person</option>
                                                    <option value="Hybrid (Combination of remote and on-site)">Hybrid (Combination of remote and on-site)</option>
                                                    <option value="Field Work / Travel Required">Field Work / Travel Required</option>
                                                </select>
                                                <FieldError message={errors.work_arrangement} />
                                            </div>

                                            {/* Compensation Type */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-compensation-type" required>Compensation Type</FieldLabel>
                                                <FieldHint>What type of compensation is being offered for this opportunity?</FieldHint>
                                                <select
                                                    id="opp-compensation-type"
                                                    value={data.compensation_type}
                                                    onChange={(e) => set("compensation_type", e.target.value)}
                                                    className={cn(inputClass(!!errors.compensation_type), "h-11 cursor-pointer")}
                                                >
                                                    <option value="">Select a compensation type…</option>
                                                    <option value="Monetary Compensation">Monetary Compensation (e.g., stipend, salary, performance-based pay)</option>
                                                    <option value="Non-monetary Compensation">Non-monetary Compensation (e.g., certificate, academic credit, travel allowance, accommodation, meals)</option>
                                                    <option value="No Compensation at all">No Compensation at all (Unpaid opportunity)</option>
                                                </select>
                                                <FieldError message={errors.compensation_type} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Duration Weeks */}
                                                <div className="space-y-1.5">
                                                    <FieldLabel htmlFor="opp-duration-weeks" required>Duration (weeks)</FieldLabel>
                                                    <FieldHint>Approximately how long? (e.g. 8 weeks)</FieldHint>
                                                    <input
                                                        id="opp-duration-weeks"
                                                        type="text"
                                                        placeholder="e.g. 8 weeks"
                                                        value={data.duration_weeks}
                                                        onChange={(e) => set("duration_weeks", e.target.value)}
                                                        className={cn(inputClass(!!errors.duration_weeks), "h-11")}
                                                    />
                                                    <FieldError message={errors.duration_weeks} />
                                                </div>

                                                {/* Start Date */}
                                                <div className="space-y-1.5">
                                                    <FieldLabel htmlFor="opp-start-date" required>Approximate Start Date</FieldLabel>
                                                    <FieldHint>Expected beginning?</FieldHint>
                                                    <Popover open={calOpen} onOpenChange={setCalOpen}>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                id="opp-start-date"
                                                                className={cn(
                                                                    inputClass(!!errors.start_date),
                                                                    "h-11 flex items-center gap-2 text-left w-full",
                                                                    !data.start_date && "text-muted-foreground/50"
                                                                )}
                                                            >
                                                                <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                                                                {data.start_date
                                                                    ? format(data.start_date, "PPP")
                                                                    : "Pick a date"}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={data.start_date}
                                                                onSelect={(d) => {
                                                                    set("start_date", d);
                                                                    setCalOpen(false);
                                                                }}
                                                                disabled={(d) => d < new Date()}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FieldError message={errors.start_date} />
                                                </div>
                                            </div>

                                            {/* PlaceCom notes */}
                                            <PlacecomNotes
                                                value={data.placecom_notes}
                                                onChange={(v) => set("placecom_notes", v)}
                                            />

                                            {/* API error */}
                                            {apiError && <ApiErrorBanner message={apiError} />}

                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleBack}
                                                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    Back
                                                </button>
                                                <Button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="flex-1 h-11 rounded-xl text-sm font-semibold"
                                                >
                                                    {isSubmitting ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                                    ) : "Submit Opportunity"}
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {/* ══ STEP 2b: Manual details ══ */}
                                    {step === "manual" && (
                                        <>
                                            <div className="mb-1">
                                                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                                                    Manual Details
                                                </h2>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    Share the essential details of the opportunity.
                                                </p>
                                            </div>

                                            {/* Job Description */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-job-desc" required>Job Description</FieldLabel>
                                                <FieldHint>Kindly share the essential details and a short description of the opportunity below. For instance, include the company name, type of role, and the location (e.g., company XYZ, marketing internship, based in Maharashtra).</FieldHint>
                                                <textarea
                                                    id="opp-job-desc"
                                                    rows={5}
                                                    placeholder="Role details, location, and key responsibilities…"
                                                    value={data.job_description}
                                                    onChange={(e) => set("job_description", e.target.value)}
                                                    className={cn(inputClass(!!errors.job_description), "py-3 resize-none leading-relaxed")}
                                                />
                                                <FieldError message={errors.job_description} />
                                            </div>

                                            {/* Eligibility Restrictions */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-eligibility" required>Eligibility Restrictions</FieldLabel>
                                                <FieldHint>Are there any eligibility restrictions for this opportunity? E.g.: only students from specific courses, graduation year, background, etc. Write N/A if none.</FieldHint>
                                                <textarea
                                                    id="opp-eligibility"
                                                    rows={3}
                                                    placeholder="e.g. Open to 3rd year UG Economics students…"
                                                    value={data.eligibility_restrictions}
                                                    onChange={(e) => set("eligibility_restrictions", e.target.value)}
                                                    className={cn(inputClass(!!errors.eligibility_restrictions), "py-3 resize-none leading-relaxed")}
                                                />
                                                <FieldError message={errors.eligibility_restrictions} />
                                            </div>

                                            {/* Compensation Type */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-comp-manual" required>Compensation Type</FieldLabel>
                                                <FieldHint>What type of compensation is being offered for this opportunity?</FieldHint>
                                                <select
                                                    id="opp-comp-manual"
                                                    value={data.compensation_type}
                                                    onChange={(e) => set("compensation_type", e.target.value)}
                                                    className={cn(inputClass(!!errors.compensation_type), "h-11 cursor-pointer")}
                                                >
                                                    <option value="">Select a compensation type…</option>
                                                    <option value="Monetary Compensation">Monetary Compensation (e.g., stipend, salary, performance-based pay)</option>
                                                    <option value="Non-monetary Compensation">Non-monetary Compensation (e.g., certificate, academic credit, travel allowance, accommodation, meals)</option>
                                                    <option value="No Compensation at all">No Compensation at all (Unpaid opportunity)</option>
                                                </select>
                                                <FieldError message={errors.compensation_type} />
                                            </div>

                                            {/* Work Arrangement */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-work-manual" required>Work Arrangement</FieldLabel>
                                                <FieldHint>Select the primary work location/setup for this opportunity.</FieldHint>
                                                <select
                                                    id="opp-work-manual"
                                                    value={data.work_arrangement}
                                                    onChange={(e) => set("work_arrangement", e.target.value)}
                                                    className={cn(inputClass(!!errors.work_arrangement), "h-11 cursor-pointer")}
                                                >
                                                    <option value="">Select an arrangement…</option>
                                                    <option value="Remote / Work from Home">Remote / Work from Home</option>
                                                    <option value="On-site / In-person">On-site / In-person</option>
                                                    <option value="Hybrid (Combination of remote and on-site)">Hybrid (Combination of remote and on-site)</option>
                                                    <option value="Field Work / Travel Required">Field Work / Travel Required</option>
                                                </select>
                                                <FieldError message={errors.work_arrangement} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Duration Weeks */}
                                                <div className="space-y-1.5">
                                                    <FieldLabel htmlFor="opp-dur-manual" required>Duration (weeks)</FieldLabel>
                                                    <FieldHint>Approximately how long? (e.g. 8 weeks)</FieldHint>
                                                    <input
                                                        id="opp-dur-manual"
                                                        type="text"
                                                        placeholder="e.g. 8 weeks"
                                                        value={data.duration_weeks}
                                                        onChange={(e) => set("duration_weeks", e.target.value)}
                                                        className={cn(inputClass(!!errors.duration_weeks), "h-11")}
                                                    />
                                                    <FieldError message={errors.duration_weeks} />
                                                </div>

                                                {/* Start Date */}
                                                <div className="space-y-1.5">
                                                    <FieldLabel htmlFor="opp-start-manual" required>Approximate Start Date</FieldLabel>
                                                    <FieldHint>When is it expected to begin?</FieldHint>
                                                    <Popover open={calOpen} onOpenChange={setCalOpen}>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                id="opp-start-manual"
                                                                className={cn(
                                                                    inputClass(!!errors.start_date),
                                                                    "h-11 flex items-center gap-2 text-left w-full",
                                                                    !data.start_date && "text-muted-foreground/50"
                                                                )}
                                                            >
                                                                <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                                                                {data.start_date
                                                                    ? format(data.start_date, "PPP")
                                                                    : "Pick a date"}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={data.start_date}
                                                                onSelect={(d) => {
                                                                    set("start_date", d);
                                                                    setCalOpen(false);
                                                                }}
                                                                disabled={(d) => d < new Date()}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FieldError message={errors.start_date} />
                                                </div>
                                            </div>

                                            {/* Apply Method */}
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="opp-apply-method" required>How can candidates apply?</FieldLabel>
                                                <FieldHint>Please share the method through which candidates can apply for this opportunity. E.g.: link to form, application portal, email id, etc.</FieldHint>
                                                <input
                                                    id="opp-apply-method"
                                                    type="text"
                                                    placeholder="e.g. Application portal link or HR email"
                                                    value={data.apply_method}
                                                    onChange={(e) => set("apply_method", e.target.value)}
                                                    className={cn(inputClass(!!errors.apply_method), "h-11")}
                                                />
                                                <FieldError message={errors.apply_method} />
                                            </div>

                                            {/* PlaceCom notes */}
                                            <PlacecomNotes
                                                value={data.placecom_notes}
                                                onChange={(v) => set("placecom_notes", v)}
                                            />

                                            {/* API error */}
                                            {apiError && <ApiErrorBanner message={apiError} />}

                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleBack}
                                                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    Back
                                                </button>
                                                <Button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="flex-1 h-11 rounded-xl text-sm font-semibold"
                                                >
                                                    {isSubmitting ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                                    ) : "Submit Opportunity"}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Shared sub-components ─── */
function PlacecomNotes({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5 rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
            <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <FieldLabel htmlFor="opp-placecom-notes">
                    Anything else you'd like to add, specifically for PlaceCom?
                </FieldLabel>
            </div>
            <FieldHint>
                Use this space to share any internal notes, preferences, or confidential
                information that is relevant for PlaceCom only. This will not be published
                on the platform.
            </FieldHint>
            <textarea
                id="opp-placecom-notes"
                rows={3}
                placeholder="e.g. Please prioritise students from CS/Econ. The recruiter prefers direct email."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "flex w-full rounded-xl border bg-background px-4 text-sm",
                    "outline-none transition-all duration-200",
                    "placeholder:text-muted-foreground/50",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    "py-3 resize-none leading-relaxed mt-1"
                )}
            />
        </div>
    );
}

function ApiErrorBanner({ message }: { message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
        </motion.div>
    );
}
