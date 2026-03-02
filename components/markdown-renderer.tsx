"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * Custom component overrides for react-markdown.
 * Every element is styled to match the site's design system —
 * this ensures markdown content looks like a designed page, not raw docs.
 */
const components: Components = {
    // ── Headings ────────────────────────────────────────────────
    h1: ({ children, ...props }) => (
        <h1
            className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-12 mb-6 first:mt-0"
            {...props}
        >
            {children}
        </h1>
    ),
    h2: ({ children, ...props }) => (
        <h2
            className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground mt-10 mb-4 border-b border-border pb-3"
            {...props}
        >
            {children}
        </h2>
    ),
    h3: ({ children, ...props }) => (
        <h3
            className="font-serif text-xl md:text-2xl font-semibold text-foreground mt-8 mb-3"
            {...props}
        >
            {children}
        </h3>
    ),
    h4: ({ children, ...props }) => (
        <h4
            className="font-sans text-lg font-semibold text-foreground mt-6 mb-2"
            {...props}
        >
            {children}
        </h4>
    ),

    // ── Block Elements ──────────────────────────────────────────
    p: ({ children, ...props }) => (
        <p
            className="text-base md:text-lg leading-relaxed text-foreground/85 mb-5"
            {...props}
        >
            {children}
        </p>
    ),
    blockquote: ({ children, ...props }) => (
        <blockquote
            className="border-l-4 border-primary/40 bg-primary/5 pl-5 py-3 pr-4 my-6 rounded-r-lg italic text-foreground/75"
            {...props}
        >
            {children}
        </blockquote>
    ),
    hr: (props) => (
        <hr className="my-10 border-border" {...props} />
    ),

    // ── Lists ───────────────────────────────────────────────────
    ul: ({ children, ...props }) => (
        <ul
            className="list-disc list-outside pl-6 space-y-2 mb-5 text-foreground/85"
            {...props}
        >
            {children}
        </ul>
    ),
    ol: ({ children, ...props }) => (
        <ol
            className="list-decimal list-outside pl-6 space-y-2 mb-5 text-foreground/85"
            {...props}
        >
            {children}
        </ol>
    ),
    li: ({ children, ...props }) => (
        <li className="text-base md:text-lg leading-relaxed pl-1" {...props}>
            {children}
        </li>
    ),

    // ── Inline Elements ─────────────────────────────────────────
    a: ({ children, href, ...props }) => (
        <a
            href={href}
            className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary/80 transition-colors font-medium"
            {...props}
        >
            {children}
        </a>
    ),
    strong: ({ children, ...props }) => (
        <strong className="font-semibold text-foreground" {...props}>
            {children}
        </strong>
    ),
    em: ({ children, ...props }) => (
        <em className="italic text-foreground/90" {...props}>
            {children}
        </em>
    ),

    // ── Code ────────────────────────────────────────────────────
    code: ({ children, className, ...props }) => {
        // Detect if this is an inline code or a code block
        const isBlock = className?.startsWith("language-");
        if (isBlock) {
            return (
                <code
                    className={`block bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed ${className}`}
                    {...props}
                >
                    {children}
                </code>
            );
        }
        return (
            <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-secondary"
                {...props}
            >
                {children}
            </code>
        );
    },
    pre: ({ children, ...props }) => (
        <pre
            className="bg-muted rounded-lg p-5 overflow-x-auto my-6 border border-border"
            {...props}
        >
            {children}
        </pre>
    ),

    // ── Tables ──────────────────────────────────────────────────
    table: ({ children, ...props }) => (
        <div className="overflow-x-auto my-6 rounded-lg border border-border">
            <table className="w-full text-sm" {...props}>
                {children}
            </table>
        </div>
    ),
    thead: ({ children, ...props }) => (
        <thead className="bg-muted/60" {...props}>
            {children}
        </thead>
    ),
    th: ({ children, ...props }) => (
        <th
            className="px-4 py-3 text-left font-semibold text-foreground border-b border-border"
            {...props}
        >
            {children}
        </th>
    ),
    td: ({ children, ...props }) => (
        <td
            className="px-4 py-3 text-foreground/80 border-b border-border/50"
            {...props}
        >
            {children}
        </td>
    ),

    // ── Images ──────────────────────────────────────────────────
    img: ({ src, alt, ...props }) => (
        <figure className="my-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt || ""}
                className="rounded-xl w-full object-cover shadow-md"
                {...props}
            />
            {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
                    {alt}
                </figcaption>
            )}
        </figure>
    ),
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    return (
        <div className={`max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
