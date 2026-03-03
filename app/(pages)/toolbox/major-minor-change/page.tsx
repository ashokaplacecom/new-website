import { ToolboxPageShell } from "@/components/toolbox-page-shell";
import { GraduationCap } from "lucide-react";

export const metadata = { title: "Major / Minor Change – Toolbox" };

export default function MajorMinorChangePage() {
    return (
        <ToolboxPageShell
            icon={GraduationCap}
            title="Major / Minor Change"
            description="Raise a request related to your major or minor programme change."
        />
    );
}
