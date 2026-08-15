"use client";

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// We must dynamically import react-quill to avoid SSR errors with the 'document' object
const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-48 w-full items-center justify-center rounded-xl border bg-background/50">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
    ) 
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled, hasError }: RichTextEditorProps) {
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ]
    }), []);

    return (
        <div className={cn(
            "rich-text-editor transition-all duration-200",
            hasError && "[&_.ql-toolbar]:border-destructive [&_.ql-container]:border-destructive"
        )}>
            <ReactQuill 
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                readOnly={disabled}
                className={cn(
                    "bg-background/50 rounded-xl overflow-hidden text-sm",
                    "[&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-muted/30",
                    "[&_.ql-container]:border-border [&_.ql-container]:rounded-b-xl [&_.ql-container]:bg-background/50",
                    "[&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-base",
                    "[&_.ql-editor.ql-blank::before]:text-muted-foreground/50 [&_.ql-editor.ql-blank::before]:font-normal"
                )}
            />
        </div>
    );
}
