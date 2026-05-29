"use server";

import prisma from "@/lib/prisma";

/**
 * Fetch all existing student emails from the database.
 * Used to diff CSV rows against what's already in the DB.
 */
export async function getExistingEmails(): Promise<string[]> {
  const students = await prisma.students.findMany({
    select: { email: true },
    where: { email: { not: null } },
  });
  return students.map((s) => s.email!).filter(Boolean);
}

/**
 * Insert new student records into the database.
 * Accepts an array of student objects matching the Prisma `students` model.
 * Returns the count of successfully inserted records.
 */
export async function importStudents(
  rows: Array<{
    name: string | null;
    email: string | null;
    program: string | null;
    emergencies_remaining: number | null;
    major_minor_change_count: number | null;
  }>
): Promise<{ success: boolean; count: number; message: string }> {
  try {
    // Filter out rows without an email — email is unique and required for insert
    const validRows = rows.filter((r) => r.email && r.email.trim() !== "");

    if (validRows.length === 0) {
      return { success: false, count: 0, message: "No valid rows to insert (all missing email)." };
    }

    const result = await prisma.students.createMany({
      data: validRows.map((r) => ({
        name: r.name || null,
        email: r.email!,
        program: r.program || null,
        emergencies_remaining: r.emergencies_remaining ?? 3,
        major_minor_change_count: r.major_minor_change_count ?? 0,
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      count: result.count,
      message: `Successfully inserted ${result.count} student${result.count === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    console.error("importStudents error:", error);
    const message = error instanceof Error ? error.message : "Unknown error during import.";
    return { success: false, count: 0, message };
  }
}
