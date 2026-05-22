"use client";

import React, { useState, useRef, useEffect } from "react";

interface EpisodeDescriptionProps {
    description: string;
    spotifyEmbedUrl?: string;
}

export function EpisodeDescription({ description, spotifyEmbedUrl }: EpisodeDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    // Parse the Spotify URL from the embed URL
    let spotifyUrl = "";
    if (spotifyEmbedUrl) {
        try {
            const url = new URL(spotifyEmbedUrl);
            if (url.pathname.includes("/embed/episode/")) {
                url.pathname = url.pathname.replace("/embed/episode/", "/episode/");
                url.search = ""; // Remove utm params
                spotifyUrl = url.toString();
            } else if (url.pathname.includes("/embed/")) {
                url.pathname = url.pathname.replace("/embed/", "/");
                url.search = "";
                spotifyUrl = url.toString();
            }
        } catch {
            if (spotifyEmbedUrl.includes("/embed/episode/")) {
                spotifyUrl = spotifyEmbedUrl.replace("/embed/episode/", "/episode/").split("?")[0];
            }
        }
    }

    useEffect(() => {
        const checkTruncation = () => {
            const el = textRef.current;
            if (el) {
                setIsTruncated(el.scrollHeight > el.clientHeight);
            }
        };

        // Run initial check and set event listener
        checkTruncation();
        window.addEventListener("resize", checkTruncation);
        
        return () => {
            window.removeEventListener("resize", checkTruncation);
        };
    }, [description]);

    const showButton = isTruncated || isExpanded;

    if (!showButton) {
        return (
            <p ref={textRef} className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {description}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <p
                ref={textRef}
                className={`text-sm text-muted-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}
            >
                {description}
            </p>
            
            {!isExpanded ? (
                <div>
                    {spotifyUrl ? (
                        <a
                            href={spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                // If they click it, also expand it inline as a fallback/convenience
                                setIsExpanded(true);
                            }}
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 focus:outline-none"
                        >
                            Read More
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
                            </svg>
                        </a>
                    ) : (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 focus:outline-none"
                        >
                            Read More
                        </button>
                    )}
                </div>
            ) : (
                // Only show "Show Less" if we expanded inline and there is no spotifyUrl,
                // or if there is a spotifyUrl, we can still show a button to collapse the text
                <div>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 focus:outline-none"
                    >
                        Show Less
                    </button>
                </div>
            )}
        </div>
    );
}
