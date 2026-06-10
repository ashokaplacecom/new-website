"use server";

import prisma from "@/lib/prisma";

import { TABLE_META, type ColumnDef, type FetchResult } from "./schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Serialize a row so BigInts become numbers and Dates become ISO strings. */
function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "bigint") {
      out[k] = Number(v);
    } else if (v instanceof Date) {
      out[k] = v.toISOString();
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Build a Prisma `select` object from the column defs so we only fetch needed fields. */
function buildSelect(columns: ColumnDef[]): Record<string, true> {
  const sel: Record<string, true> = {};
  for (const c of columns) {
    sel[c.key] = true;
  }
  return sel;
}

/** Determine if a numeric column is BigInt or standard Int in the schema. */
function isBigIntField(tableName: string, columnKey: string): boolean {
  if (columnKey === "id") {
    return tableName !== "major_minor_change";
  }
  if (columnKey === "poc") return true;
  if (columnKey === "student") return true;
  if (columnKey === "modified_by") return true;
  return false;
}

/** Dynamically construct a Prisma `where` clause to search string/email columns and numeric IDs. */
function buildWhere(tableName: string, meta: typeof TABLE_META[0], search?: string): Record<string, any> {
  if (!search || !search.trim()) return {};
  const s = search.trim();
  
  const searchFields = meta.columns.filter((c) => c.type === "string" || c.type === "email" || c.type === "enum");
  const orConditions: Record<string, any>[] = searchFields.map((c) => {
    if (tableName === "students" && c.key === "poc") {
      return {
        pocs: {
          poc_name: {
            contains: s,
            mode: "insensitive",
          },
        },
      };
    }
    return {
      [c.key]: {
        contains: s,
        mode: "insensitive",
      },
    };
  });

  const intVal = parseInt(s, 10);
  if (!isNaN(intVal) && String(intVal) === s) {
    const numFields = meta.columns.filter((c) => c.type === "number");
    for (const c of numFields) {
      const isBigInt = isBigIntField(tableName, c.key);
      orConditions.push({
        [c.key]: isBigInt ? BigInt(intVal) : intVal,
      });
    }
  }

  if (orConditions.length === 0) return {};
  return { OR: orConditions };
}

// ---------------------------------------------------------------------------
// fetchTablePage — lazy, paginated read with search
// ---------------------------------------------------------------------------

export async function fetchTablePage(
  tableName: string,
  page: number = 0,
  pageSize: number = 50,
  search?: string,
): Promise<FetchResult> {
  const meta = TABLE_META.find((t) => t.name === tableName);
  if (!meta) return { rows: [], totalCount: 0 };

  const select = buildSelect(meta.columns);
  const skip = page * pageSize;
  const where = buildWhere(tableName, meta, search);

  switch (tableName) {
    case "students": {
      const [rows, count, allPocs] = await Promise.all([
        prisma.students.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            program: true,
            emergencies_remaining: true,
            major_minor_change_count: true,
            pocs: {
              select: {
                poc_name: true,
              },
            },
          },
          skip,
          take: pageSize,
          orderBy: { id: "asc" },
        }),
        prisma.students.count({ where }),
        prisma.pocs.findMany({
          select: { poc_name: true },
          orderBy: { poc_name: "asc" },
        }),
      ]);

      const pocOptions = allPocs.map((p) => p.poc_name).filter(Boolean) as string[];
      const mappedRows = rows.map((r) => {
        const serialized = serializeRow(r);
        const p = r.pocs as { poc_name: string | null } | null;
        serialized.poc = p?.poc_name ?? "";
        return serialized;
      });

      return { rows: mappedRows, totalCount: count, pocOptions };
    }
    case "pocs": {
      const [rows, count] = await Promise.all([
        prisma.pocs.findMany({ where, select, skip, take: pageSize, orderBy: { id: "asc" } }),
        prisma.pocs.count({ where }),
      ]);
      return { rows: rows.map(serializeRow), totalCount: count };
    }
    case "verifications": {
      const [rows, count] = await Promise.all([
        prisma.verifications.findMany({ where, select, skip, take: pageSize, orderBy: { id: "asc" } }),
        prisma.verifications.count({ where }),
      ]);
      return { rows: rows.map(serializeRow), totalCount: count };
    }
    case "major_minor_change": {
      const [rows, count] = await Promise.all([
        prisma.major_minor_change.findMany({ where, select, skip, take: pageSize, orderBy: { id: "asc" } }),
        prisma.major_minor_change.count({ where }),
      ]);
      return { rows: rows.map(serializeRow), totalCount: count };
    }
    case "external_opportunities": {
      const [rows, count] = await Promise.all([
        prisma.external_opportunities.findMany({ where, select, skip, take: pageSize, orderBy: { id: "asc" } }),
        prisma.external_opportunities.count({ where }),
      ]);
      return { rows: rows.map(serializeRow), totalCount: count };
    }
    default:
      return { rows: [], totalCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// updateRow — single-row write
// ---------------------------------------------------------------------------

export async function updateRow(
  tableName: string,
  rowId: number,
  data: Record<string, unknown>,
): Promise<{ success: boolean; message: string }> {
  try {
    const meta = TABLE_META.find((t) => t.name === tableName);
    if (!meta) return { success: false, message: `Unknown table: ${tableName}` };

    const cleaned: Record<string, unknown> = {};
    for (const col of meta.columns) {
      if (!col.editable) continue;
      if (!(col.key in data)) continue;

      const v = data[col.key];
      if (v === null || v === undefined || v === "") {
        cleaned[col.key] = null;
      } else if (col.type === "number") {
        cleaned[col.key] = Number(v);
      } else if (col.type === "boolean") {
        cleaned[col.key] = v === true || v === "true";
      } else if (col.type === "date") {
        cleaned[col.key] = new Date(String(v));
      } else {
        cleaned[col.key] = String(v);
      }
    }

    switch (tableName) {
      case "students": {
        const updateData = { ...cleaned };
        if ("poc" in cleaned) {
          let pocId: bigint | null = null;
          if (cleaned.poc) {
            const pocRecord = await prisma.pocs.findFirst({
              where: { poc_name: String(cleaned.poc) },
              select: { id: true },
            });
            pocId = pocRecord ? pocRecord.id : null;
          }
          updateData.poc = pocId;
        }

        await prisma.students.update({ where: { id: BigInt(rowId) }, data: updateData });
        break;
      }
      case "pocs":
        await prisma.pocs.update({ where: { id: BigInt(rowId) }, data: cleaned });
        break;
      case "verifications":
        await prisma.verifications.update({ where: { id: BigInt(rowId) }, data: cleaned });
        break;
      case "major_minor_change":
        await prisma.major_minor_change.update({ where: { id: rowId }, data: cleaned });
        break;
      case "external_opportunities":
        await prisma.external_opportunities.update({ where: { id: BigInt(rowId) }, data: cleaned });
        break;
      default:
        return { success: false, message: `Unknown table: ${tableName}` };
    }

    return { success: true, message: "Row updated successfully." };
  } catch (error) {
    console.error(`updateRow(${tableName}, ${rowId}) error:`, error);
    const message = error instanceof Error ? error.message : "Unknown error during update.";
    return { success: false, message };
  }
}

// ---------------------------------------------------------------------------
// deleteRows — bulk/single-row delete
// ---------------------------------------------------------------------------

export async function deleteRows(
  tableName: string,
  ids: number[],
): Promise<{ success: boolean; message: string }> {
  try {
    const meta = TABLE_META.find((t) => t.name === tableName);
    if (!meta) return { success: false, message: `Unknown table: ${tableName}` };

    if (ids.length === 0) {
      return { success: true, message: "No rows selected to delete." };
    }

    const isBigInt = tableName !== "major_minor_change";
    const typedIds = isBigInt ? ids.map((id) => BigInt(id)) : ids;

    switch (tableName) {
      case "students":
        await prisma.students.deleteMany({ where: { id: { in: typedIds as bigint[] } } });
        break;
      case "pocs":
        await prisma.pocs.deleteMany({ where: { id: { in: typedIds as bigint[] } } });
        break;
      case "verifications":
        await prisma.verifications.deleteMany({ where: { id: { in: typedIds as bigint[] } } });
        break;
      case "major_minor_change":
        await prisma.major_minor_change.deleteMany({ where: { id: { in: typedIds as number[] } } });
        break;
      case "external_opportunities":
        await prisma.external_opportunities.deleteMany({ where: { id: { in: typedIds as bigint[] } } });
        break;
      default:
        return { success: false, message: `Unknown table: ${tableName}` };
    }

    return { success: true, message: `Successfully deleted ${ids.length} row(s).` };
  } catch (error) {
    console.error(`deleteRows(${tableName}, ${ids}) error:`, error);
    const message = error instanceof Error ? error.message : "Unknown error during delete.";
    return { success: false, message };
  }
}

// ---------------------------------------------------------------------------
// bulkUpdateRows — bulk update a specific column
// ---------------------------------------------------------------------------

export async function bulkUpdateRows(
  tableName: string,
  ids: number[] | 'all',
  columnKey: string,
  value: unknown,
): Promise<{ success: boolean; message: string }> {
  try {
    const meta = TABLE_META.find((t) => t.name === tableName);
    if (!meta) return { success: false, message: `Unknown table: ${tableName}` };

    // Type casting logic for the value based on column definition
    let finalValue = value;
    const colDef = meta.columns.find((c) => c.key === columnKey);
    if (!colDef) return { success: false, message: `Unknown column: ${columnKey}` };

    if (value === null || value === undefined || value === "") {
        finalValue = null;
    } else if (colDef.type === "number") {
        finalValue = Number(value);
    } else if (colDef.type === "boolean") {
        finalValue = value === true || value === "true";
    }

    const dataObj = { [columnKey]: finalValue };
    const isBigInt = tableName !== "major_minor_change";
    const typedIds = ids === 'all' ? [] : (isBigInt ? ids.map((id) => BigInt(id)) : ids);
    const whereClause: any = ids === 'all' ? {} : { id: { in: typedIds } };

    switch (tableName) {
      case "students":
        await prisma.students.updateMany({ where: whereClause, data: dataObj });
        break;
      case "pocs":
        await prisma.pocs.updateMany({ where: whereClause, data: dataObj as any });
        break;
      case "verifications":
        await prisma.verifications.updateMany({ where: whereClause, data: dataObj as any });
        break;
      case "major_minor_change":
        await prisma.major_minor_change.updateMany({ where: whereClause, data: dataObj as any });
        break;
      case "external_opportunities":
        await prisma.external_opportunities.updateMany({ where: whereClause, data: dataObj as any });
        break;
      default:
        return { success: false, message: `Unknown table: ${tableName}` };
    }

    return { success: true, message: `Successfully bulk updated rows.` };
  } catch (error) {
    console.error(`bulkUpdateRows(${tableName}) error:`, error);
    const message = error instanceof Error ? error.message : "Unknown error during bulk update.";
    return { success: false, message };
  }
}
