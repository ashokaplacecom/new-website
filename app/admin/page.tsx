import prisma from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

async function getDashboardData() {
  // Run all queries in parallel
  const [
    totalStudents,
    verificationsByStatus,
    degreeChangesByStatus,
    totalPocs,
    pocVerifications,
    pocDegreeChanges,
    pocList,
  ] = await Promise.all([
    // Total students
    prisma.students.count(),

    // Verifications grouped by status
    prisma.verifications.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Degree changes grouped by status
    prisma.major_minor_change.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Total POCs
    prisma.pocs.count(),

    // Verifications per POC (modified_by)
    prisma.verifications.groupBy({
      by: ["modified_by"],
      _count: { id: true },
      where: { modified_by: { not: null } },
    }),

    // Degree changes per POC (modified_by)
    prisma.major_minor_change.groupBy({
      by: ["modified_by"],
      _count: { id: true },
      where: { modified_by: { not: null } },
    }),

    // All POCs for name lookup
    prisma.pocs.findMany({
      select: { id: true, poc_name: true, role: true },
    }),
  ]);

  // Parse verification counts by status
  const vStatusMap = Object.fromEntries(
    verificationsByStatus.map((v) => [v.status ?? "unknown", v._count.id])
  );
  const totalVerifications =
    (vStatusMap.pending ?? 0) + (vStatusMap.approved ?? 0) + (vStatusMap.rejected ?? 0);
  const pendingVerifications = vStatusMap.pending ?? 0;
  const approvedVerifications = vStatusMap.approved ?? 0;
  const rejectedVerifications = vStatusMap.rejected ?? 0;

  // Parse degree change counts by status
  const dStatusMap = Object.fromEntries(
    degreeChangesByStatus.map((d) => [d.status ?? "unknown", d._count.id])
  );
  const totalDegreeChanges =
    (dStatusMap.pending ?? 0) + (dStatusMap.approved ?? 0) + (dStatusMap.rejected ?? 0);
  const pendingDegreeChanges = dStatusMap.pending ?? 0;
  const approvedDegreeChanges = dStatusMap.approved ?? 0;
  const rejectedDegreeChanges = dStatusMap.rejected ?? 0;

  // Build POC leaderboard
  const pocNameMap = new Map(
    pocList.map((p) => [p.id.toString(), { name: p.poc_name ?? "Unknown", role: p.role ?? "standard" }])
  );

  const pocScores = new Map<string, { verificationCount: number; degreeChangeCount: number }>();

  for (const pv of pocVerifications) {
    const key = pv.modified_by!.toString();
    const existing = pocScores.get(key) ?? { verificationCount: 0, degreeChangeCount: 0 };
    existing.verificationCount = pv._count.id;
    pocScores.set(key, existing);
  }

  for (const pd of pocDegreeChanges) {
    const key = pd.modified_by!.toString();
    const existing = pocScores.get(key) ?? { verificationCount: 0, degreeChangeCount: 0 };
    existing.degreeChangeCount = pd._count.id;
    pocScores.set(key, existing);
  }

  const topPocs = Array.from(pocScores.entries())
    .map(([id, scores]) => {
      const info = pocNameMap.get(id) ?? { name: "Unknown", role: "standard" };
      return {
        name: info.name,
        role: info.role,
        verificationCount: scores.verificationCount,
        degreeChangeCount: scores.degreeChangeCount,
      };
    })
    .sort((a, b) => (b.verificationCount + b.degreeChangeCount) - (a.verificationCount + a.degreeChangeCount))
    .slice(0, 10);

  return {
    totalStudents,
    totalVerifications,
    totalDegreeChanges,
    pendingVerifications,
    pendingDegreeChanges,
    approvedVerifications,
    approvedDegreeChanges,
    rejectedVerifications,
    rejectedDegreeChanges,
    totalPocs,
    topPocs,
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}
