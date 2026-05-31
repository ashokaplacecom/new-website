export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // 1. Fetch ALL pending verifications + any from the last week (for metrics)
        const verifsData = await prisma.verifications.findMany({
            where: {
                OR: [
                    { status: 'pending' },
                    { request_at: { gte: oneWeekAgo } },
                ],
            },
            orderBy: { id: 'asc' },
        });

        // 2. Fetch ALL pending major-minor changes + any from the last week (for metrics)
        const mmcData = await prisma.major_minor_change.findMany({
            where: {
                OR: [
                    { status: 'pending' },
                    { created_at: { gte: oneWeekAgo } },
                ],
            },
            orderBy: { id: 'asc' },
        });

        // 3. Extract unique student IDs
        const studentIds = new Set<bigint>();
        for (const v of verifsData) { if (v.student) studentIds.add(v.student); }
        for (const m of mmcData) { if (m.student) studentIds.add(m.student); }

        let studentsData: { id: bigint; name: string | null; email: string | null; poc: bigint | null }[] = [];
        if (studentIds.size > 0) {
            studentsData = await prisma.students.findMany({
                where: { id: { in: Array.from(studentIds) } },
                select: { id: true, name: true, email: true, poc: true },
            });
        }

        // 4. Extract unique POC IDs
        const pocIds = new Set<bigint>();
        studentsData.forEach(s => { if (s.poc) pocIds.add(s.poc); });

        let pocsData: { id: bigint; poc_name: string | null }[] = [];
        if (pocIds.size > 0) {
            pocsData = await prisma.pocs.findMany({
                where: { id: { in: Array.from(pocIds) } },
                select: { id: true, poc_name: true },
            });
        }

        // Create lookups (use Number for BigInt keys)
        const studentMap = new Map(studentsData.map(s => [Number(s.id), s]));
        const pocMap = new Map(pocsData.map(p => [Number(p.id), p]));

        // Format for frontend
        const formattedRequests = [];

        for (const v of verifsData) {
            const student = v.student ? studentMap.get(Number(v.student)) : null;
            const pocId = student?.poc ? Number(student.poc) : null;
            const poc = pocId ? pocMap.get(pocId) : null;

            formattedRequests.push({
                type: 'verification',
                id: `VER-${Number(v.id)}`,
                baseId: Number(v.id),
                studentName: student?.name || "Unknown",
                email: student?.email || "",
                poc: poc?.poc_name || "Unassigned",
                deadline: v.deadline?.toISOString() ?? null,
                status: v.is_emergency ? "emergency" : v.status,
                studentMessage: v.student_message,
                pocMessage: v.poc_note || ""
            });
        }

        for (const m of mmcData) {
            const student = m.student ? studentMap.get(Number(m.student)) : null;
            const pocId = student?.poc ? Number(student.poc) : null;
            const poc = pocId ? pocMap.get(pocId) : null;

            const defaultDeadline = new Date(m.created_at.getTime() + 48 * 60 * 60 * 1000).toISOString();

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
