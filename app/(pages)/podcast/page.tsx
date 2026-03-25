import { getPageContent, getJsonData } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Podcast — Connect PlaceCom",
    description:
        "Candid conversations about careers, ambition, and life after Ashoka University — the PlaceCom Podcast.",
};

/* ─── Types ─── */
interface PodcastEpisode {
    id: string;
    title: string;
    spotifyEmbedUrl: string;
    description: string;
}

interface PodcastData {
    episodes: PodcastEpisode[];
}

/* ─── Page (Server Component) ─── */
export default function PodcastPage() {
    const { frontmatter, content } = getPageContent("podcast");
    const { episodes } = getJsonData<PodcastData>("podcast");

    return (
        <main className="min-h-screen w-full">
            <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">

                {/* ── Page Header ── */}
                <div className="mb-10 md:mb-14">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
                        {frontmatter.title ?? "PlaceCom Podcast"}
                    </h1>
                    <MarkdownRenderer content={content} />
                </div>

                {/* ── Episodes Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {episodes.map((ep) => (
                        <div
                            key={ep.id}
                            className="flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Spotify embed */}
                            <iframe
                                id={`podcast-embed-${ep.id}`}
                                src={ep.spotifyEmbedUrl}
                                width="100%"
                                height="152"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="block shrink-0"
                                title={ep.title}
                            />

                            {/* Card body */}
                            <div className="flex flex-col gap-1.5 p-4 flex-1">
                                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                                    {ep.title}
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {ep.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}
