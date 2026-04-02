"use client";

import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, Loader2, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sendContactEmail } from "./actions";

import contactData from "@/content/data/contact.json";

/* ─── Schema ─── */
const contactSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    message: z
        .string()
        .min(20, "Message must be at least 20 characters")
        .max(2000, "Message cannot exceed 2000 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

/* ─── Input helper ─── */
const inputClass = (hasError?: boolean) =>
    cn(
        "flex w-full rounded-xl border bg-background px-4 text-sm",
        "outline-none transition-all duration-200",
        "placeholder:text-muted-foreground/50",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        hasError && "border-destructive focus:border-destructive focus:ring-destructive/20"
    );

type ContactInfo = {
    emails: { label: string; address: string }[];
    phones: { label: string; number: string }[];
};

const contact = contactData as ContactInfo;

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<ContactValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            fullName: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const { formState: { errors } } = form;

    const handleSubmit = useCallback(async (values: ContactValues) => {
        setIsLoading(true);
        setApiError(null);
        try {
            const result = await sendContactEmail(values);
            if (result.status === "success") {
                setIsSuccess(true);
                form.reset();
            } else if (result.status === "error") {
                setApiError(result.message ?? "Failed to send your message. Please try again.");
            }
        } catch {
            setApiError("Unexpected error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [form]);

    return (
        <main className="min-h-screen w-full">
            <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
                {/* Page Header (mobile only shown above the split) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* ── Left Column ── */}
                    <div className="flex flex-col gap-8">
                        {/* Icon + Title */}
                        <div>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-5">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
                                Contact us
                            </h1>
                            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                                Have a question or want to get in touch? We are always
                                looking for ways to improve our services. Reach out and
                                let us know how we can help you.
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col gap-5">
                            {/* Emails */}
                            {contact.emails.map((item) => (
                                <div key={item.address} className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0 mt-0.5">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground/70 mb-0.5">{item.label}</p>
                                        <a
                                            href={`mailto:${item.address}`}
                                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                                        >
                                            {item.address}
                                        </a>
                                    </div>
                                </div>
                            ))}

                            {/* Phones */}
                            {contact.phones.map((item) => (
                                <div key={item.number} className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0 mt-0.5">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground/70 mb-0.5">{item.label}</p>
                                        <a
                                            href={`tel:${item.number.replace(/\s/g, "")}`}
                                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                                        >
                                            {item.number}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Placeholder area for future map */}
                        <div
                            id="contact-map-placeholder"
                            className="hidden lg:flex rounded-2xl border border-border/50 bg-card/40 h-52 items-center justify-center text-muted-foreground/40 text-sm"
                        >
                            {/* Map will go here */}
                        </div>
                    </div>

                    {/* ── Right Column: Form ── */}
                    <div
                        className={cn(
                            "relative overflow-hidden rounded-2xl border bg-card",
                            "shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]"
                        )}
                    >
                        <div className="p-6 md:p-8">
                            {isSuccess ? (
                                /* ── Success state ── */
                                <motion.div
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
                                        <h2 className="text-xl font-semibold text-foreground">Message sent!</h2>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Thanks for reaching out. We&apos;ll get back to you as soon as possible.
                                        </p>
                                    </motion.div>
                                    <button
                                        onClick={() => setIsSuccess(false)}
                                        className="mt-2 text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                /* ── Form ── */
                                <form
                                    onSubmit={form.handleSubmit(handleSubmit)}
                                    className="space-y-5"
                                    noValidate
                                >
                                    <div className="mb-2">
                                        <h2 className="text-lg font-semibold text-foreground tracking-tight">
                                            Send us a message
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            Fill in the form below and we&apos;ll get back to you shortly.
                                        </p>
                                    </div>

                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
                                            Full name <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            placeholder="Your full name"
                                            {...form.register("fullName")}
                                            disabled={isLoading}
                                            className={cn(inputClass(!!errors.fullName), "h-11")}
                                        />
                                        {errors.fullName && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-sm text-destructive"
                                            >
                                                {errors.fullName.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                                            Email address <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            {...form.register("email")}
                                            disabled={isLoading}
                                            className={cn(inputClass(!!errors.email), "h-11")}
                                        />
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-sm text-destructive"
                                            >
                                                {errors.email.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">
                                            Subject <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="contact-subject"
                                            type="text"
                                            placeholder="What is this about?"
                                            {...form.register("subject")}
                                            disabled={isLoading}
                                            className={cn(inputClass(!!errors.subject), "h-11")}
                                        />
                                        {errors.subject && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-sm text-destructive"
                                            >
                                                {errors.subject.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                                            Message <span className="text-destructive">*</span>
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            rows={5}
                                            placeholder="Type your message here…"
                                            {...form.register("message")}
                                            disabled={isLoading}
                                            className={cn(
                                                inputClass(!!errors.message),
                                                "py-3 resize-none leading-relaxed"
                                            )}
                                        />
                                        {errors.message ? (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-sm text-destructive"
                                            >
                                                {errors.message.message}
                                            </motion.p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground/60 text-right">
                                                {form.watch("message")?.length ?? 0} / 2000
                                            </p>
                                        )}
                                    </div>

                                    {/* API Error */}
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

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-xl text-sm font-semibold"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
