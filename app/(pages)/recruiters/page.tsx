"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2, User, Mail, Send, Loader2, CheckCircle2, AlertTriangle, ArrowRight, FileText, Type, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sendRecruiterEmail } from "./actions";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

/* ─── Schema ─── */
const recruiterSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Work email is required").email("Please enter a valid email address"),
    company: z.string().min(2, "Company name is required"),
    opportunityType: z.string().min(2, "Please select an option"),
    subject: z.string().min(2, "Subject line is required"),
    message: z.string().max(20000, "Message is too long").optional().or(z.literal("")),
});

type RecruiterValues = z.infer<typeof recruiterSchema>;

const HIRE_OPP_TYPES = [
    "Full-time Role",
    "Summer Internship",
    "Winter Internship",
    "Research/Academic Project",
    "Campus Ambassador Program",
    "Other/Exploring Options"
];

const KNOW_OPP_TYPES = [
    "Campus Visit",
    "Guest Speaker / Talk",
    "Explore Partnerships",
    "General Inquiry"
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

export default function RecruiterPage() {
    const [activeTab, setActiveTab] = useState<"hire" | "know">("hire");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentOppTypes = activeTab === "hire" ? HIRE_OPP_TYPES : KNOW_OPP_TYPES;

    const form = useForm<RecruiterValues>({
        resolver: zodResolver(recruiterSchema),
        defaultValues: {
            fullName: "",
            email: "",
            company: "",
            opportunityType: "",
            subject: "",
            message: "",
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

    const handleSubmit = useCallback(async (values: RecruiterValues) => {
        if (activeTab === "hire" && !documentFile) {
            setFileError("Please attach a Job Description or relevant document.");
            return;
        }

        setIsLoading(true);
        setApiError(null);
        
        try {
            const fd = new FormData();
            fd.append("fullName", values.fullName);
            fd.append("email", values.email);
            fd.append("company", values.company);
            // Append tab indicator so we know what they chose if needed, but opportunityType handles it
            fd.append("opportunityType", values.opportunityType);
            fd.append("subject", values.subject);
            fd.append("message", values.message);
            if (documentFile) {
                fd.append("document", documentFile);
            }

            const result = await sendRecruiterEmail(fd);
            
            if (result.status === "success") {
                setIsSuccess(true);
                form.reset();
                setDocumentFile(null);
            } else if (result.status === "error") {
                setApiError(result.message ?? "Failed to send your inquiry. Please try again.");
            }
        } catch {
            setApiError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [form, documentFile, activeTab]);

    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20">
            {/* Premium Hero Section */}
            <div className="w-full bg-foreground text-background py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
                <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-xs font-semibold tracking-widest uppercase mb-6">
                            Corporate Partnerships
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                            Partner with Ashoka
                        </h1>
                        <p className="text-lg md:text-xl text-muted/80 max-w-2xl mx-auto font-light leading-relaxed">
                            Connect with our Placement Committee to recruit exceptional talent or explore long-term institutional partnerships.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 -mt-12 relative z-20">
                <div className={cn(
                    "relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-xl",
                    "shadow-2xl shadow-black/[0.08]"
                )}>
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 px-8 text-center"
                        >
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100/50 mb-8 ring-8 ring-emerald-50">
                                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-4">Inquiry Received</h2>
                            <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
                                Thank you for your interest in partnering with Ashoka University. Our team will reach out to you shortly.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setIsSuccess(false)}
                                className="h-12 px-8 rounded-xl font-medium"
                            >
                                Submit Another Inquiry
                            </Button>
                        </motion.div>
                    ) : (
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 md:p-12" noValidate>
                            {/* Tab Switcher */}
                            <div className="flex p-1.5 bg-muted/40 border rounded-xl mb-10 mx-auto max-w-md">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("hire");
                                        form.setValue("opportunityType", "");
                                        form.clearErrors("opportunityType");
                                    }}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-semibold rounded-lg transition-all",
                                        activeTab === "hire" 
                                            ? "bg-background shadow-sm text-foreground border border-border/50" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Hire from Us
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("know");
                                        form.setValue("opportunityType", "Get to Know Us");
                                        form.clearErrors("opportunityType");
                                    }}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-semibold rounded-lg transition-all",
                                        activeTab === "know" 
                                            ? "bg-background shadow-sm text-foreground border border-border/50" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Get to Know Us
                                </button>
                            </div>

                            <div className="mb-10 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                                    {activeTab === "hire" ? "Initiate Hiring Partnership" : "Connect with Us"}
                                </h2>
                                <p className="text-sm md:text-base text-muted-foreground mt-2">
                                    {activeTab === "hire" 
                                        ? "Leave your details below and a dedicated team member will contact you to facilitate the hiring process." 
                                        : "Leave your details below and we will reach out to discuss talks, visits, and other collaborations."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" /> Full Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        {...form.register("fullName")}
                                        disabled={isLoading}
                                        className={inputClass(!!errors.fullName)}
                                    />
                                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                                </div>

                                {/* Work Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" /> Work Email <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="jane@company.com"
                                        {...form.register("email")}
                                        disabled={isLoading}
                                        className={inputClass(!!errors.email)}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>

                                {/* Company Name */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary" /> Organization Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. McKinsey & Company, Microsoft"
                                        {...form.register("company")}
                                        disabled={isLoading}
                                        className={inputClass(!!errors.company)}
                                    />
                                    {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
                                </div>

                                {/* Opportunity Type (Only for Hire from Us) */}
                                {activeTab === "hire" && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-primary" /> Opportunity Type <span className="text-destructive">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                                            {HIRE_OPP_TYPES.map((type) => {
                                                const isSelected = form.watch("opportunityType") === type;
                                                return (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            form.setValue("opportunityType", type);
                                                            form.clearErrors("opportunityType");
                                                        }}
                                                        className={cn(
                                                            "text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                                            isSelected
                                                                ? "bg-primary border-primary text-primary-foreground shadow-md"
                                                                : "bg-background border-border text-foreground hover:border-primary/50"
                                                        )}
                                                    >
                                                        {type}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.opportunityType && <p className="text-xs text-destructive mt-1">{errors.opportunityType.message}</p>}
                                    </div>
                                )}
                                
                                {/* Subject Line */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Type className="w-4 h-4 text-primary" /> Subject Line <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={activeTab === "hire" ? "e.g. Campus Recruitment Drive 2026" : "e.g. Exploring Institutional Partnership"}
                                        {...form.register("subject")}
                                        disabled={isLoading}
                                        className={inputClass(!!errors.subject)}
                                    />
                                    {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                                </div>

                                {/* Message (Rich Text) */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" /> {activeTab === "hire" ? "Job Description & Details" : "Message & Details"}
                                    </label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {activeTab === "hire" 
                                            ? "Provide a job description, roles, timeline, or questions you have." 
                                            : "Provide details about your organization, proposed visit, or questions you have."}
                                    </p>
                                    <RichTextEditor
                                        value={form.watch("message")}
                                        onChange={(val) => {
                                            form.setValue("message", val);
                                            form.clearErrors("message");
                                        }}
                                        disabled={isLoading}
                                        hasError={!!errors.message}
                                    />
                                    {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                                </div>
                                
                                {/* File Upload */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Paperclip className="w-4 h-4 text-primary" /> Attach Documents {activeTab === "hire" ? <span className="text-destructive">*</span> : "(Optional)"}
                                    </label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {activeTab === "hire" 
                                            ? "Attach JD PDFs, brochures, or other supporting documents (Max 5MB)."
                                            : "Attach company profiles, brochures, or other supporting documents (Max 5MB)."}
                                    </p>
                                    <div 
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all",
                                            fileError ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50 bg-background/50",
                                            documentFile ? "border-primary/50 bg-primary/5" : ""
                                        )}
                                        onClick={() => fileInputRef.current?.click()}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <input 
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.txt"
                                            disabled={isLoading}
                                        />
                                        
                                        {documentFile ? (
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <FileText className="h-8 w-8 text-primary" />
                                                <p className="text-sm font-medium text-foreground">{documentFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <Button type="button" variant="link" className="h-auto p-0 text-xs text-destructive mt-1" onClick={(e) => { e.stopPropagation(); setDocumentFile(null); }}>Remove file</Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                                <Paperclip className="h-8 w-8 text-muted-foreground/50" />
                                                <p className="text-sm font-medium">Click to upload a document</p>
                                                <p className="text-xs">PDF, DOC, DOCX up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                    {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                                </div>

                                {/* API Error */}
                                {apiError && (
                                    <div className="md:col-span-2 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive mt-4">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        {apiError}
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="md:col-span-2 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 rounded-2xl text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Sending Inquiry & Uploading...
                                            </>
                                        ) : (
                                            <>
                                                Submit Inquiry
                                                <ArrowRight className="h-5 w-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground mt-6">
                                        By submitting this form, you agree to be contacted by Ashoka University's Career Development Office.
                                    </p>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
