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
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Info,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";

import { generateOtpAction, verifyOtpAndCreateVerificationAction } from "@/app/(pages)/toolbox/verifications/actions";

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

const otpSchema = z.object({
    otp: z.string().length(4, "Please enter the complete 4-digit OTP"),
    message: z.string().optional(),
});

const emergencySchema = z.object({
    otp: z.string().length(4, "Please enter the complete 4-digit OTP"),
    company: z.string().min(1, "Company name is required"),
    reason: z.string().min(1, "Please provide a valid reason"),
});

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type EmergencyValues = z.infer<typeof emergencySchema>;

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
        title: "Emergency Request",
        description: "Provide details for your emergency verification.",
    },
    {
        title: "Request Submitted",
        description: "Your verification request has been processed.",
    },
];

/* ─── Constants ─── */
const RESEND_COOLDOWN = 60; // 60s for real OTPs

/* ─── Slide Variants ─── */
const slideVariants = {
    initial: (direction: number) => ({ x: `${110 * direction}%`, opacity: 0 }),
    animate: { x: "0%", opacity: 1 },
    exit: (direction: number) => ({ x: `${-110 * direction}%`, opacity: 0 }),
};

/* ─── Component ─── */
export function VerificationForm() {
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
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Email form ── */
    const emailForm = useForm<EmailValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    /* ── OTP form ── */
    const otpForm = useForm<OtpValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "", message: "" },
    });

    /* ── Emergency form ── */
    const emergencyForm = useForm<EmergencyValues>({
        resolver: zodResolver(emergencySchema),
        defaultValues: { otp: "", company: "", reason: "" },
    });

    /* ── Resend timer logic ── */
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
        };
    }, []);

    /* ── Navigation helpers ── */
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
                await generateOtpAction(values.email);
                setEmail(values.email);
                startResendTimer();
                haptic("success");
                goTo(1);
            } catch (err: any) {
                haptic("error");
                setApiError(err.message || "Failed to send OTP. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [goTo, startResendTimer, haptic]
    );

    /* ── Step 1: Verify OTP (normal) ── */
    const handleOtpSubmit = useCallback(
        async (values: OtpValues) => {
            haptic("light");
            setIsLoading(true);
            setApiError(null);
            try {
                await verifyOtpAndCreateVerificationAction({
                    email,
                    otp: values.otp,
                    message: values.message,
                    isEmergency: false,
                });
                
                haptic("success");
                setSuccessMessage(
                    "Your verification request has been submitted successfully."
                );
                setIsSuccess(true);
                goTo(3);
            } catch (err: any) {
                haptic("error");
                setApiError(err.message || "Verification failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [email, goTo, haptic]
    );

    /* ── Step 2: Emergency submit ── */
    const handleEmergencySubmit = useCallback(
        async (values: EmergencyValues) => {
            haptic("light");
            setIsLoading(true);
            setApiError(null);
            try {
                const fullMessage = `Company: ${values.company}\nReason: ${values.reason}`;
                
                await verifyOtpAndCreateVerificationAction({
                    email,
                    otp: values.otp,
                    message: fullMessage,
                    isEmergency: true,
                });
                
                haptic("success");
                setSuccessMessage(
                    "Your emergency verification request has been submitted. You will be contacted shortly."
                );
                setIsSuccess(true);
                goTo(3);
            } catch (err: any) {
                haptic("error");
                setApiError(err.message || "Emergency request failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [email, goTo, haptic]
    );

    /* ── Resend OTP ── */
    const handleResend = useCallback(async () => {
        if (resendTimer > 0 || !email) return;
        haptic("selection");
        try {
            await generateOtpAction(email);
            startResendTimer();
            haptic("success");
        } catch (err: any) {
            haptic("error");
            setApiError(err.message || "Failed to resend OTP.");
        }
    }, [resendTimer, email, startResendTimer, haptic]);

    /* ── Subscribe to formState so useMemo re-evaluates on validation ── */
    const emailErrors = emailForm.formState.errors;
    const emergencyErrors = emergencyForm.formState.errors;
    const emailSubmitCount = emailForm.formState.submitCount;
    const emergencySubmitCount = emergencyForm.formState.submitCount;

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
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Student Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="yourname@ashoka.edu.in"
                                {...emailForm.register("email")}
                                disabled={isLoading}
                                className={cn(
                                    "flex h-12 w-full rounded-xl border bg-background px-4 text-sm",
                                    "outline-none transition-all duration-200",
                                    "placeholder:text-muted-foreground/50",
                                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    emailForm.formState.errors.email &&
                                    "border-destructive focus:border-destructive focus:ring-destructive/20"
                                )}
                            />
                            {emailForm.formState.errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-destructive"
                                >
                                    {emailForm.formState.errors.email.message}
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

            /* ───── STEP 1: OTP + Message ───── */
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

                        {/* Info banner */}
                        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-[13px] leading-relaxed text-amber-900/80 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-200/80">
                            <div className="flex gap-2">
                                <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <span className="font-semibold">IMP:</span> You can
                                    raise UPTO 3 emergency requests (per semester) to
                                    expedite the verification process. Ensure details are
                                    accurate; rejected requests still count towards your
                                    limit. Once a request is raised, further insistence may
                                    be penalized.
                                </div>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Enter OTP
                            </label>
                            <OtpInput
                                value={otpValue}
                                onChange={(val) => {
                                    setOtpValue(val);
                                    otpForm.setValue("otp", val);
                                    emergencyForm.setValue("otp", val);
                                }}
                                error={!!apiError}
                            />
                        </div>

                        {/* Message to PoC */}
                        <div className="space-y-2">
                            <label
                                htmlFor="message"
                                className="text-sm font-medium text-foreground"
                            >
                                Message to PoC{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optional)
                                </span>
                            </label>
                            <textarea
                                id="message"
                                placeholder="Add a message for your PoC (optional)"
                                {...otpForm.register("message")}
                                rows={3}
                                className={cn(
                                    "flex w-full rounded-xl border bg-background px-4 py-3 text-sm",
                                    "outline-none transition-all duration-200 resize-none",
                                    "placeholder:text-muted-foreground/50",
                                    "focus:border-primary focus:ring-2 focus:ring-primary/20"
                                )}
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

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    haptic("light");
                                    emergencyForm.setValue("otp", otpValue);
                                    setApiError(null);
                                    goTo(2);
                                }}
                                className="w-full h-12 rounded-xl text-sm font-semibold"
                            >
                                Submit as Emergency
                            </Button>
                            <Button
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                    otpForm.setValue("otp", otpValue);
                                    otpForm.handleSubmit(handleOtpSubmit)();
                                }}
                                className="w-full h-12 rounded-xl text-sm font-semibold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying…
                                    </>
                                ) : (
                                    "Verify & Submit"
                                )}
                            </Button>
                        </div>

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

            /* ───── STEP 2: Emergency ───── */
            case 2:
                return (
                    <form
                        onSubmit={emergencyForm.handleSubmit(handleEmergencySubmit, () => haptic("error"))}
                        className="space-y-5 py-4"
                    >
                        {/* Info banner */}
                        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-[13px] leading-relaxed text-destructive dark:border-destructive/30">
                            <div className="flex gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    Emergency requests are limited. Only use this if you
                                    have a genuine, time-sensitive need.
                                </div>
                            </div>
                        </div>

                        {/* OTP display (read-only hint) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                OTP Code
                            </label>
                            <OtpInput
                                value={otpValue}
                                onChange={(val) => {
                                    setOtpValue(val);
                                    emergencyForm.setValue("otp", val);
                                }}
                                error={
                                    !!emergencyForm.formState.errors.otp || !!apiError
                                }
                            />
                            {emergencyForm.formState.errors.otp && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-destructive"
                                >
                                    {emergencyForm.formState.errors.otp.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Company */}
                        <div className="space-y-2">
                            <label
                                htmlFor="company"
                                className="text-sm font-medium text-foreground"
                            >
                                Company of Application
                            </label>
                            <input
                                id="company"
                                type="text"
                                placeholder="e.g. Google, McKinsey"
                                {...emergencyForm.register("company")}
                                className={cn(
                                    "flex h-12 w-full rounded-xl border bg-background px-4 text-sm",
                                    "outline-none transition-all duration-200",
                                    "placeholder:text-muted-foreground/50",
                                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                                    emergencyForm.formState.errors.company &&
                                    "border-destructive focus:border-destructive focus:ring-destructive/20"
                                )}
                            />
                            {emergencyForm.formState.errors.company && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-destructive"
                                >
                                    {emergencyForm.formState.errors.company.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label
                                htmlFor="reason"
                                className="text-sm font-medium text-foreground"
                            >
                                Valid Reason for Emergency
                            </label>
                            <textarea
                                id="reason"
                                placeholder="Explain why this is urgent…"
                                {...emergencyForm.register("reason")}
                                rows={3}
                                className={cn(
                                    "flex w-full rounded-xl border bg-background px-4 py-3 text-sm",
                                    "outline-none transition-all duration-200 resize-none",
                                    "placeholder:text-muted-foreground/50",
                                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                                    emergencyForm.formState.errors.reason &&
                                    "border-destructive focus:border-destructive focus:ring-destructive/20"
                                )}
                            />
                            {emergencyForm.formState.errors.reason && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-destructive"
                                >
                                    {emergencyForm.formState.errors.reason.message}
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

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl text-sm font-semibold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Submitting…
                                    </>
                                ) : (
                                    "Submit Emergency Request"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { haptic("selection"); goTo(1, -1); }}
                                className="w-full h-10 rounded-xl text-sm font-medium text-muted-foreground"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to regular submission
                            </Button>
                        </div>
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
        otpForm,
        emergencyForm,
        emailErrors,
        emergencyErrors,
        emailSubmitCount,
        emergencySubmitCount,
        isLoading,
        apiError,
        email,
        otpValue,
        resendTimer,
        isSuccess,
        successMessage,
        handleEmailSubmit,
        handleOtpSubmit,
        handleEmergencySubmit,
        handleResend,
        goTo,
    ]);

    /* ── Progress indicators for steps 0-2 (not shown on success) ── */
    const totalSteps = 3; // 0, 1, 2 visible; 3 = success
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
