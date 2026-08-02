"use client";

import Image from "next/image";
import { Linkedin } from "lucide-react";
import type { TeamMember } from "@/lib/content-types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TeamMemberCard({ member }: { member: TeamMember }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group cursor-pointer flex flex-col gap-3">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                        <Image
                            src={member.image || "/images/uploads/placeholder.jpg"}
                            alt={member.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized={process.env.NODE_ENV === "development"}
                        />
                        
                        {/* LinkedIn Icon on Hover (Top Right) */}
                        {member.linkedinUrl && (
                            <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
                                <div className="bg-white text-primary rounded-sm p-1.5 shadow-md hover:bg-muted/90 transition-colors">
                                    <Linkedin className="size-4 fill-current" />
                                </div>
                            </div>
                        )}
                        
                        {/* Subtle bottom fade */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">
                            {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-snug">
                            {member.role}
                        </p>
                    </div>
                </div>
            </DialogTrigger>

            {/* Modal Content */}
            <DialogContent className="sm:max-w-3xl overflow-hidden p-0 rounded-xl">
                <div className="flex flex-col sm:flex-row h-full max-h-[80vh] sm:max-h-[600px]">
                    {/* Left side: Image */}
                    <div className="relative w-full sm:w-2/5 aspect-square sm:aspect-auto sm:h-full bg-muted shrink-0">
                        <Image
                            src={member.image || "/images/uploads/placeholder.jpg"}
                            alt={member.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 40vw"
                            unoptimized={process.env.NODE_ENV === "development"}
                        />
                    </div>
                    
                    {/* Right side: Content */}
                    <div className="flex flex-col p-6 sm:p-8 sm:w-3/5 overflow-y-auto">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <DialogTitle className="font-serif text-2xl md:text-3xl font-bold">
                                    {member.name}
                                </DialogTitle>
                                <DialogDescription className="text-base font-medium text-primary mt-1">
                                    {member.role}
                                </DialogDescription>
                            </div>
                            {member.linkedinUrl && (
                                <a 
                                    href={member.linkedinUrl.startsWith('http') ? member.linkedinUrl : `https://${member.linkedinUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="shrink-0 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full p-2.5 transition-colors"
                                    aria-label={`Visit ${member.name}'s LinkedIn profile`}
                                >
                                    <Linkedin className="size-5 fill-current" />
                                </a>
                            )}
                        </div>
                        
                        <div className="prose prose-sm dark:prose-invert text-muted-foreground mt-2 max-w-none">
                            {member.bio ? (
                                member.bio.split('\n').map((paragraph, i) => (
                                    <p key={i} className="mb-4 last:mb-0 text-base leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))
                            ) : (
                                <p className="italic text-muted-foreground/60">No bio provided.</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
