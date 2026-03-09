export type FileType = "document" | "spreadsheet" | "presentation" | "image" | "other";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "ghost";

export interface ResourceBadge {
    label: string;
    variant?: BadgeVariant;
}

export interface ResourceFile {
    id: string;
    name: string;
    type: "file";
    fileType: FileType;
    url: string;
    description?: string;
    badges?: ResourceBadge[];
}

export interface ResourceFolder {
    id: string;
    name: string;
    type: "folder";
    children: ResourceNode[];
}

export type ResourceNode = ResourceFile | ResourceFolder;
