"use client";

import { useState, useMemo } from "react";
import { Search, Mail, HelpCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface FAQItem {
    category: string;
    question: string;
    answer: string;
}

interface FAQsClientProps {
    faqs: FAQItem[];
}

export function FAQsClient({ faqs }: FAQsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categories = useMemo(() => {
        const unique = Array.from(new Set(faqs.map((f) => f.category)));
        return ["All", ...unique];
    }, [faqs]);

    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesCategory =
                selectedCategory === "All" || faq.category === selectedCategory;
            const matchesSearch =
                faq.question.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase().trim());
            return matchesCategory && matchesSearch;
        });
    }, [faqs, selectedCategory, searchQuery]);

    return (
        <div className="space-y-8 w-full">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search questions or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-9 h-11 rounded-xl bg-card border-border/60 text-sm shadow-xs transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer",
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Accordion List */}
            {filteredFaqs.length > 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs divide-y divide-border/40 overflow-hidden shadow-xs">
                    <Accordion type="single" collapsible className="w-full">
                        {filteredFaqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="px-6 border-b border-border/40 last:border-b-0"
                            >
                                <AccordionTrigger className="text-left font-medium text-foreground py-4 hover:no-underline hover:text-primary transition-colors gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-left">
                                        <Badge
                                            variant="secondary"
                                            className="w-fit text-[10px] font-medium tracking-wide shrink-0"
                                        >
                                            {faq.category}
                                        </Badge>
                                        <span className="text-sm font-semibold sm:font-medium">
                                            {faq.question}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/80 rounded-2xl bg-card/30 p-6 space-y-3">
                    <div className="p-3 bg-muted rounded-full text-muted-foreground">
                        <HelpCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                        <p className="text-sm font-medium text-foreground">No questions found</p>
                        <p className="text-xs text-muted-foreground">
                            We couldn't find any questions matching "{searchQuery}". Try searching with different keywords or clearing your filter.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                        }}
                        className="text-xs font-semibold text-primary hover:underline pt-1"
                    >
                        Reset filters
                    </button>
                </div>
            )}

            {/* Help / Contact Footer Card */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 via-card to-card/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Have a question not answered here?
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md">
                        Reach out to the Placement Committee. We're here to help guide you through every step of the placement season.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <a
                        href="mailto:connect.placecom@ashoka.edu.in"
                        className="inline-flex items-center justify-center text-xs font-medium px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs w-full sm:w-auto text-center"
                    >
                        Contact PlaceCom
                    </a>
                    <Link
                        href="/toolbox/resources"
                        className="inline-flex items-center justify-center text-xs font-medium px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors w-full sm:w-auto text-center"
                    >
                        Browse Resources
                    </Link>
                </div>
            </div>
        </div>
    );
}
