import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabaseAdmin = createAdminClient();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Fetch pending verifications OR from the last week
        const { data: verifsData, error: verifsError } = await supabaseAdmin
            .schema("requests")
            .from("verifications")
            .select('*')
            .or(`status.eq.pending,request_at.gte.${oneWeekAgo}`);

        if (verifsError) throw verifsError;

        // 2. Fetch pending major-minor changes OR from the last week
        const { data: mmcData, error: mmcError } = await supabaseAdmin
            .schema("requests")
            .from("major-minor-change")
            .select('*')
            .or(`status.eq.pending,created_at.gte.${oneWeekAgo}`);

        if (mmcError) throw mmcError;

        // 3. Extract unique student IDs
        const studentIds = new Set<number>();
        verifsData.forEach(v => studentIds.add(v.student));
        mmcData.forEach(m => studentIds.add(m.student));

        let studentsData: any[] = [];
        if (studentIds.size > 0) {
            // 4. Fetch students
            const { data, error: studentsError } = await supabaseAdmin
                .from('students')
                .select('id, name, email, poc')
                .in('id', Array.from(studentIds));

            if (studentsError) throw studentsError;
            studentsData = data || [];
        }

        // 5. Extract unique POC IDs
        const pocIds = new Set<number>();
        studentsData.forEach(s => {
            if (s.poc) pocIds.add(s.poc);
        });

        let pocsData: any[] = [];
        if (pocIds.size > 0) {
            // 6. Fetch POCs
            const { data, error: pocsError } = await supabaseAdmin
                .schema('requests')
                .from('pocs')
                .select('id, poc_name')
                .in('id', Array.from(pocIds));

            if (pocsError) throw pocsError;
            pocsData = data || [];
        }

        // Create lookups
        const studentMap = new Map(studentsData.map(s => [s.id, s]));
        const pocMap = new Map(pocsData.map(p => [p.id, p]));

        // Format for frontend
        const formattedRequests = [];

        for (const v of verifsData) {
            const student = studentMap.get(v.student);
            const pocId = student?.poc;
            const poc = pocId ? pocMap.get(pocId) : null;

            formattedRequests.push({
                type: 'verification',
                id: `VER-${v.id}`, 
                baseId: v.id,
                studentName: student?.name || "Unknown",
                email: student?.email || "",
                poc: poc?.poc_name || "Unassigned",
                deadline: v.deadline, 
                status: v.is_emergency ? "emergency" : v.status,
                studentMessage: v.student_message,
                pocMessage: v.poc_note || ""
            });
        }

        for (const m of mmcData) {
            const student = studentMap.get(m.student);
            const pocId = student?.poc;
            const poc = pocId ? pocMap.get(pocId) : null;

            const defaultDeadline = new Date(new Date(m.created_at).getTime() + 48 * 60 * 60 * 1000).toISOString();
            
            const messageParts = [];
            if (m.current_major) messageParts.push(`Current Major: ${m.current_major}`);
            if (m.current_minor) messageParts.push(`Current Minor: ${m.current_minor}`);
            if (m.prospective_major) messageParts.push(`Prospective Major: ${m.prospective_major}`);
            if (m.prospective_minor) messageParts.push(`Prospective Minor: ${m.prospective_minor}`);

            formattedRequests.push({
                type: 'major-minor',
                id: `MMC-${m.id}`,
                baseId: m.id,
                studentName: student?.name || "Unknown",
                email: student?.email || "",
                poc: poc?.poc_name || "Unassigned",
                deadline: defaultDeadline,
                status: m.status,
                studentMessage: messageParts.join("\n"),
                pocMessage: m.poc_note || ""
            });
        }

        return NextResponse.json({ success: true, data: formattedRequests });

    } catch (e: any) {
        console.error("Error fetching dashboard requests:", e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
