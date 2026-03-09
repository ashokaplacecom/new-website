"use client";

import { FileIcon } from "@untitledui/file-icons";
import type { FileType } from "@/types/resources";

/** Maps our high-level FileType to the Untitled UI FileIcon `type` prop */
const FILE_TYPE_TO_ICON: Record<FileType, string> = {
    document: "document",
    spreadsheet: "spreadsheets",
    presentation: "pptx",
    image: "image",
    other: "empty",
};

interface ResourceFileIconProps {
    fileType: FileType;
    /** Icon rendering size in px — defaults to 40 for cards, pass 24 for sidebar */
    size?: number;
    className?: string;
}

export function ResourceFileIcon({
    fileType,
    size = 40,
    className,
}: ResourceFileIconProps) {
    const iconType = FILE_TYPE_TO_ICON[fileType] ?? "empty";
    return (
        <span className={`inline-flex shrink-0 ${className ?? ""}`}>
            <FileIcon type={iconType} size={size} />
        </span>
    );
}

/** Compact variant used inside the sidebar tree */
export function ResourceFileIconSmall({ fileType }: { fileType: FileType }) {
    const iconType = FILE_TYPE_TO_ICON[fileType] ?? "empty";
    return <FileIcon type={iconType} size={20} />;
}
