export type ColumnType = "string" | "number" | "email" | "enum" | "date" | "boolean";

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
  options?: string[];
  editable: boolean;
}

export interface TableMeta {
  name: string;
  label: string;
  columns: ColumnDef[];
}

export interface FetchResult {
  rows: Record<string, unknown>[];
  totalCount: number;
  pocOptions?: string[];
}

export const TABLE_META: TableMeta[] = [
  {
    name: "students",
    label: "Students",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "name", label: "Full Name", type: "string", editable: true },
      { key: "email", label: "Email", type: "email", editable: true },
      { key: "program", label: "Program", type: "string", editable: true },
      { key: "emergencies_remaining", label: "Emergencies", type: "number", editable: true },
      { key: "poc", label: "POC", type: "enum", options: [], editable: true },
      { key: "major_minor_change_count", label: "Degree Changes", type: "number", editable: true },
    ],
  },
  {
    name: "pocs",
    label: "POCs",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "poc_name", label: "Name", type: "string", editable: true },
      { key: "email", label: "Email", type: "email", editable: true },
      { key: "role", label: "Role", type: "enum", options: ["standard", "leadership"], editable: true },
    ],
  },
  {
    name: "verifications",
    label: "Verifications",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "request_at", label: "Requested", type: "date", editable: false },
      { key: "student", label: "Student ID", type: "number", editable: true },
      { key: "status", label: "Status", type: "enum", options: ["pending", "approved", "rejected"], editable: true },
      { key: "student_message", label: "Message", type: "string", editable: true },
      { key: "is_emergency", label: "Emergency", type: "boolean", editable: true },
      { key: "poc_note", label: "POC Note", type: "string", editable: true },
      { key: "modified_by", label: "Modified By", type: "number", editable: true },
      { key: "deadline", label: "Deadline", type: "date", editable: true },
    ],
  },
  {
    name: "major_minor_change",
    label: "Degree Changes",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "created_at", label: "Created", type: "date", editable: false },
      { key: "student", label: "Student ID", type: "number", editable: true },
      { key: "current_major", label: "Current Major", type: "string", editable: true },
      { key: "current_minor", label: "Current Minor", type: "string", editable: true },
      { key: "prospective_major", label: "New Major", type: "string", editable: true },
      { key: "prospective_minor", label: "New Minor", type: "string", editable: true },
      { key: "status", label: "Status", type: "enum", options: ["pending", "approved", "rejected"], editable: true },
      { key: "poc_note", label: "POC Note", type: "string", editable: true },
      { key: "modified_by", label: "Modified By", type: "number", editable: true },
    ],
  },
  {
    name: "external_opportunities",
    label: "External Opps",
    columns: [
      { key: "id", label: "ID", type: "number", editable: false },
      { key: "created_at", label: "Created", type: "date", editable: false },
      { key: "title", label: "Title", type: "string", editable: true },
      { key: "recruiting_body", label: "Company", type: "string", editable: true },
      { key: "role", label: "Role", type: "string", editable: true },
      { key: "category", label: "Category", type: "string", editable: true },
      { key: "deadline", label: "Deadline", type: "date", editable: true },
      { key: "is_active", label: "Active", type: "boolean", editable: true },
      { key: "compensation", label: "Compensation", type: "string", editable: true },
      { key: "work_arrangement", label: "Work Type", type: "string", editable: true },
    ],
  },
];
