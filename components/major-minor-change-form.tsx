"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWebHaptics } from "web-haptics/react";
import {
    ChevronRight,
    Loader2,
    CheckCircle2,
    Info,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";

/* ─── Schemas ─── */
const emailSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .refine((v) => v.endsWith("@ashoka.edu.in"), {
            message: "Only @ashoka.edu.in emails are accepted",
        }),
});

const changeSchema = z.object({
    email: z.string().email(),
    ashokaId: z.string().min(1, "Ashoka ID is required"),
    currentMajor: z.string().optional(),
    prospectiveMajor: z.string().optional(),
    currentMinor: z.string().optional(),
    prospectiveMinor: z.string().optional(),
});

type EmailValues = z.infer<typeof emailSchema>;
type ChangeValues = z.infer<typeof changeSchema>;

/* ─── Step Metadata ─── */
const stepMeta = [
    {
        title: "Verify Your Email",
        description: "Enter your Ashoka University email to get started.",
    },
    {
        title: "Enter Verification Code",
        description: "We've sent a 4-digit OTP to your email.",
    },
    {
        title: "Major / Minor Change Request",
        description: "Fill in your current and prospective programme details.",
    },
    {
        title: "Request Submitted",
        description: "Your request has been processed successfully.",
    },
];

const MOCK_OTP = "1234";
const RESEND_COOLDOWN = 20;

/* ─── Slide Variants ─── */
const slideVariants = {
    initial: (direction: number) => ({ x: `${110 * direction}%`, opacity: 0 }),
    animate: { x: "0%", opacity: 1 },
    exit: (direction: number) => ({ x: `${-110 * direction}%`, opacity: 0 }),
};

/* ─── Component ─── */
export function MajorMinorChangeForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [ref, bounds] = useMeasure();
    const { trigger: haptic } = useWebHaptics();

    // Global state
    const [email, setEmail] = useState("");
    const [otpValue, setOtpValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [otpVerifying, setOtpVerifying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Email form ── */
    const emailForm = useForm<EmailValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    /* ── Change form ── */
    const changeForm = useForm<ChangeValues>({
        resolver: zodResolver(changeSchema),
        defaultValues: {
            email: "",
            ashokaId: "",
            currentMajor: "",
            prospectiveMajor: "",
            currentMinor: "",
            prospectiveMinor: "",
        },
    });

    /* ── Resend timer ── */
    const startResendTimer = useCallback(() => {
        setResendTimer(RESEND_COOLDOWN);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    /* ── Navigation ── */
    const goTo = useCallback((step: number, dir: 1 | -1 = 1) => {
        setDirection(dir);
        setCurrentStep(step);
        setApiError(null);
    }, []);

    /* ── Step 0: Submit email ── */
    const handleEmailSubmit = useCallback(
        async (values: EmailValues) => {
            haptic("light");
            setIsLoading(true);
            setApiError(null);
            try {
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setEmail(values.email);
                changeForm.setValue("email", values.email);
                startResendTimer();
                haptic("success");
                goTo(1);
            } catch {
                haptic("error");
                setApiError("Failed to send OTP. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [goTo, startResendTimer, changeForm, haptic]
    );

    /* ── Step 1: OTP auto-submit with debounce ── */
    const handleOtpComplete = useCallback(
        (otp: string) => {
            if (otp.length !== 4) return;

            // Clear any existing debounce
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(async () => {
                setOtpVerifying(true);
                setApiError(null);
                try {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    if (otp !== MOCK_OTP) {
                        haptic("error");
                        setApiError("Invalid OTP. Please try again.");
                        setOtpVerifying(false);
                        return;
                    }
                    haptic("success");
                    setOtpVerifying(false);
                    goTo(2);
                } catch {
                    haptic("error");
                    setApiError("Verification failed. Please try again.");
                    setOtpVerifying(false);
                }
            }, 2000);
        },
        [goTo, haptic]
    );

    /* ── Step 2: Submit change request ── */
    const handleChangeSubmit = useCallback(
        async (values: ChangeValues) => {
            haptic("light");
            setIsLoading(true);
            setApiError(null);
            try {
                await new Promise((resolve) => setTimeout(resolve, 1500));
                console.log("Change request submitted:", values);
                haptic("success");
                setSuccessMessage(
                    "Your major/minor change request has been submitted successfully. You'll receive a confirmation email shortly."
                );
                setIsSuccess(true);
                goTo(3);
            } catch {
                haptic("error");
                setApiError("Failed to submit request. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [goTo, haptic]
    );

    /* ── Resend OTP ── */
    const handleResend = useCallback(() => {
        if (resendTimer > 0) return;
        haptic("selection");
        startResendTimer();
    }, [resendTimer, startResendTimer, haptic]);

    /* ── Subscribe to formState for reactivity ── */
    const emailErrors = emailForm.formState.errors;
    const changeErrors = changeForm.formState.errors;
    const emailSubmitCount = emailForm.formState.submitCount;
    const changeSubmitCount = changeForm.formState.submitCount;

    /* ─── Input class helper ─── */
    const inputClass = (hasError?: boolean) =>
        cn(
            "flex h-12 w-full rounded-xl border bg-background px-4 text-sm",
            "outline-none transition-all duration-200",
            "placeholder:text-muted-foreground/50",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError &&
            "border-destructive focus:border-destructive focus:ring-destructive/20"
        );

    /* ── Step Content ── */
    const content = useMemo(() => {
        switch (currentStep) {
            /* ───── STEP 0: Email ───── */
            case 0:
                return (
                    <form
                        onSubmit={emailForm.handleSubmit(handleEmailSubmit, () => haptic("error"))}
                        className="space-y-6 py-4"
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="mm-email"
                                className="text-sm font-medium text-foreground"
                            >
                                Student Email
                            </label>
                            <input
                                id="mm-email"
                                type="email"
                                placeholder="yourname@ashoka.edu.in"
                                {...emailForm.register("email")}
                                disabled={isLoading}
                                className={inputClass(!!emailErrors.email)}
                            />
                            {emailErrors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-destructive"
                                >
                                    {emailErrors.email.message}
                                </motion.p>
                            )}
                        </div>
                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {apiError}
                            </motion.div>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl text-sm font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending OTP…
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                );

            /* ───── STEP 1: OTP only, auto-submit ───── */
            case 1:
                return (
                    <div className="space-y-5 py-4">
                        {/* Success banner */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 rounded-xl bg-primary/8 px-4 py-3 text-sm font-medium text-primary"
                        >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            OTP sent to {email}
                        </motion.div>

                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Enter OTP
                            </label>
                            <OtpInput
                                value={otpValue}
                                onChange={(val) => {
                                    setOtpValue(val);
                                    setApiError(null);
                                    handleOtpComplete(val);
                                }}
                                error={!!apiError}
                                disabled={otpVerifying}
                            />
                        </div>

                        {/* Auto-submit indicator */}
                        {otpValue.length === 4 && !apiError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                            >
                                {otpVerifying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        Verifying…
                                    </>
                                ) : (
                                    "Verifying in a moment…"
                                )}
                            </motion.div>
                        )}

                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {apiError}
                            </motion.div>
                        )}

                        {/* Resend */}
                        <div className="text-center text-sm text-muted-foreground">
                            Didn&apos;t get OTP?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendTimer > 0}
                                className={cn(
                                    "font-medium transition-colors",
                                    resendTimer > 0
                                        ? "text-muted-foreground/50 cursor-not-allowed"
                                        : "text-primary hover:text-primary/80 underline underline-offset-2"
                                )}
                            >
                                Resend{resendTimer > 0 ? ` (${resendTimer}s)` : ""}
                            </button>
                        </div>
                    </div>
                );

            /* ───── STEP 2: Change Request Form ───── */
            case 2:
                return (
                    <form
                        onSubmit={changeForm.handleSubmit(handleChangeSubmit, () => haptic("error"))}
                        className="space-y-5 py-4"
                    >
                        {/* Info alert */}
                        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-[13px] leading-relaxed text-primary/80">
                            <div className="flex gap-2">
                                <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                                <div>
                                    Changes to your major or minor are subject to
                                    approval by the relevant academic departments.
                                    Please ensure your selections are accurate before
                                    submitting.
                                </div>
                            </div>
                        </div>

                        {/* Email (auto-filled, read-only) */}
                        <div className="space-y-2">
                            <label
                                htmlFor="change-email"
                                className="text-sm font-medium text-foreground"
                            >
                                Email{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="change-email"
                                type="email"
                                value={email}
                                readOnly
                                disabled
                                className={cn(inputClass(), "bg-muted/50 cursor-not-allowed")}
                            />
                        </div>

                        {/* Ashoka ID */}
                        <div className="space-y-2">
                            <label
                                htmlFor="ashoka-id"
                                className="text-sm font-medium text-foreground"
                            >
                                Ashoka ID{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="ashoka-id"
                                type="text"
                                placeholder="e.g. 10202XXXXX"
                                {...changeForm.register("ashokaId")}
                                className={inputClass(!!changeErrors.ashokaId)}
                            />
                            {changeErrors.ashokaId && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-destructive"
                                >
                                    {changeErrors.ashokaId.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Optional fields alert */}
                        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-[13px] leading-relaxed text-amber-900/80 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-200/80">
                            <div className="flex gap-2">
                                <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    Fill all relevant fields. Leave blank if not
                                    applicable.
                                </div>
                            </div>
                        </div>

                        {/* Current Major */}
                        <div className="space-y-2">
                            <label
                                htmlFor="current-major"
                                className="text-sm font-medium text-foreground"
                            >
                                Current Major
                            </label>
                            <input
                                id="current-major"
                                type="text"
                                placeholder="Current major"
                                {...changeForm.register("currentMajor")}
                                className={inputClass()}
                            />
                        </div>

                        {/* Prospective Major */}
                        <div className="space-y-2">
                            <label
                                htmlFor="prospective-major"
                                className="text-sm font-medium text-foreground"
                            >
                                Prospective Major
                            </label>
                            <input
                                id="prospective-major"
                                type="text"
                                placeholder="Prospective major"
                                {...changeForm.register("prospectiveMajor")}
                                className={inputClass()}
                            />
                        </div>

                        {/* Current Minor */}
                        <div className="space-y-2">
                            <label
                                htmlFor="current-minor"
                                className="text-sm font-medium text-foreground"
                            >
                                Current Minor
                            </label>
                            <input
                                id="current-minor"
                                type="text"
                                placeholder="Current minor"
                                {...changeForm.register("currentMinor")}
                                className={inputClass()}
                            />
                            <p className="text-[13px] text-muted-foreground/70 italic">
                                If you are declaring a minor for the first time, please
                                write <span className="font-semibold not-italic">NA</span> in this box.
                            </p>
                        </div>

                        {/* Prospective Minor */}
                        <div className="space-y-2">
                            <label
                                htmlFor="prospective-minor"
                                className="text-sm font-medium text-foreground"
                            >
                                Prospective Minor
                            </label>
                            <input
                                id="prospective-minor"
                                type="text"
                                placeholder="Prospective minor"
                                {...changeForm.register("prospectiveMinor")}
                                className={inputClass()}
                            />
                        </div>

                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {apiError}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl text-sm font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>

                        <p className="text-center text-[13px] text-muted-foreground/60 italic">
                            Fill all relevant fields. Leave blank if not applicable.
                        </p>
                    </form>
                );

            /* ───── STEP 3: Success ───── */
            case 3:
                return (
                    <div className="flex flex-col items-center justify-center py-12 space-y-5">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                delay: 0.1,
                            }}
                            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                        >
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-center space-y-2"
                        >
                            <h3 className="text-lg font-semibold text-foreground">
                                {isSuccess ? "Request Submitted!" : "Error"}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                {successMessage}
                            </p>
                        </motion.div>
                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive max-w-sm"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {apiError}
                            </motion.div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    }, [
        currentStep,
        emailForm,
        changeForm,
        emailErrors,
        changeErrors,
        emailSubmitCount,
        changeSubmitCount,
        isLoading,
        apiError,
        email,
        otpValue,
        otpVerifying,
        resendTimer,
        isSuccess,
        successMessage,
        handleEmailSubmit,
        handleOtpComplete,
        handleChangeSubmit,
        handleResend,
        inputClass,
    ]);

    const totalSteps = 3;
    const progressStep = Math.min(currentStep, 2);

    return (
        <MotionConfig
            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
        >
            <div className="w-full max-w-lg mx-auto">
                <div
                    className={cn(
                        "relative overflow-hidden rounded-2xl border bg-card",
                        "shadow-lg shadow-black/[0.04]",
                        "dark:shadow-black/[0.2]"
                    )}
                >
                    <motion.div layout>
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-2">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                    {stepMeta[currentStep].title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {stepMeta[currentStep].description}
                                </p>
                            </div>
                            {currentStep < 3 && (
                                <div className="flex items-center gap-1.5 pt-1.5">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-300",
                                                progressStep === i
                                                    ? "w-6 bg-primary"
                                                    : progressStep > i
                                                        ? "w-1.5 bg-primary/40"
                                                        : "w-1.5 bg-primary/15"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content with animated height */}
                        <motion.div
                            animate={{
                                height: bounds.height > 0 ? bounds.height : "auto",
                            }}
                            className="relative overflow-hidden"
                            transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.5,
                            }}
                        >
                            <div ref={ref}>
                                <div className="px-6 pb-6">
                                    <AnimatePresence
                                        mode="popLayout"
                                        initial={false}
                                        custom={direction}
                                    >
                                        <motion.div
                                            key={currentStep}
                                            variants={slideVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            custom={direction}
                                            className="w-full"
                                        >
                                            {content}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </MotionConfig>
    );
}
