"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Paperclip, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sendFeedbackEmail } from "./actions";

const feedbackSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
    issueType: z.string().min(1, "Please select the type of feedback"),
    description: z.string().min(10, "Please provide more details (at least 10 characters)").max(5000, "Message is too long"),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

const ISSUE_TYPES = [
    "Internships",
    "Placements",
    "Connect Website",
    "General / Other"
];

const inputClass = (hasError?: boolean) =>
    cn(
        "flex w-full rounded-xl border bg-background/50 px-4 py-3 text-sm backdrop-blur-sm",
        "outline-none transition-all duration-200",
        "placeholder:text-muted-foreground/50",
        "focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        hasError && "border-destructive focus:border-destructive focus:ring-destructive/20"
    );

export default function FeedbackPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FeedbackValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            fullName: "",
            email: "",
            issueType: "",
            description: "",
        },
    });

    const { formState: { errors } } = form;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) {
            setDocumentFile(null);
            setFileError(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFileError("File must be less than 5MB");
            setDocumentFile(null);
            return;
        }
        setFileError(null);
        setDocumentFile(file);
    };

    const handleSubmit = useCallback(async (values: FeedbackValues) => {
        setIsLoading(true);
        setApiError(null);
        
        try {
            const fd = new FormData();
            if (values.fullName) fd.append("fullName", values.fullName);
            if (values.email) fd.append("email", values.email);
            fd.append("issueType", values.issueType);
            fd.append("description", values.description);
            if (documentFile) {
                fd.append("document", documentFile);
            }

            const result = await sendFeedbackEmail(fd);
            
            if (result.status === "success") {
                setIsSuccess(true);
                form.reset();
                setDocumentFile(null);
            } else if (result.status === "error") {
                setApiError(result.message ?? "Failed to send feedback. Please try again.");
            }
        } catch {
            setApiError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [form, documentFile]);

    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20 pb-24 pt-12 md:pt-20">
            <div className="max-w-3xl mx-auto px-4">
                
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            Feedback & Support
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Have a suggestion, concern, or feedback about our processes? Let us know so we can improve.
                        </p>
                    </motion.div>
                </div>

                <div className={cn(
                    "relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-xl",
                    "shadow-xl shadow-black/[0.04]"
                )}>
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 px-8 text-center"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Feedback Received!</h2>
                            <p className="text-base text-muted-foreground max-w-sm mx-auto mb-8">
                                Thank you for taking the time to help us improve. We appreciate your input!
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setIsSuccess(false)}
                                className="h-11 px-6 rounded-xl font-medium"
                            >
                                Submit Another
                            </Button>
                        </motion.div>
                    ) : (
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 md:p-10 space-y-8" noValidate>
                            
                            {/* Issue Type */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" /> What is this regarding? <span className="text-destructive">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ISSUE_TYPES.map((type) => {
                                        const isSelected = form.watch("issueType") === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    form.setValue("issueType", type);
                                                    form.clearErrors("issueType");
                                                }}
                                                className={cn(
                                                    "text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                                    isSelected
                                                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                                        : "bg-background border-border text-foreground hover:border-primary/50"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.issueType && <p className="text-xs text-destructive">{errors.issueType.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" /> Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        {...form.register("fullName")}
                                        disabled={isLoading}
                                        className={inputClass(!!errors.fullName)}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" /> Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="jane@ashoka.edu.in"
                                        {...form.register("email")}
                                        disabled={isLoading}
                                        className={inputClass(!!errors.email)}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Details <span className="text-destructive">*</span>
                                </label>
                                <p className="text-xs text-muted-foreground mb-2">Please describe the issue or your suggestion in detail.</p>
                                <textarea
                                    placeholder="I noticed that..."
                                    {...form.register("description")}
                                    disabled={isLoading}
                                    rows={5}
                                    className={cn(inputClass(!!errors.description), "resize-y min-h-[120px]")}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                            </div>
                            
                            {/* File Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-muted-foreground" /> Attach Screenshot (Optional)
                                </label>
                                <div 
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer",
                                        fileError ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50 bg-background/50",
                                        documentFile ? "border-primary/50 bg-primary/5" : ""
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        disabled={isLoading}
                                    />
                                    
                                    {documentFile ? (
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <p className="text-sm font-medium text-foreground">{documentFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <Button type="button" variant="link" className="h-auto p-0 text-xs text-destructive mt-1" onClick={(e) => { e.stopPropagation(); setDocumentFile(null); }}>Remove file</Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                            <Paperclip className="h-6 w-6 text-muted-foreground/50" />
                                            <p className="text-sm font-medium">Click to upload a screenshot</p>
                                            <p className="text-xs">Images or PDF up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                                {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                            </div>

                            {/* API Error */}
                            {apiError && (
                                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                                    <AlertTriangle className="h-5 w-5 shrink-0" />
                                    {apiError}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl text-base font-medium transition-all hover:-translate-y-0.5"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Feedback
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
