'use server';

import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const RESOURCES_BASE = path.join(process.cwd(), 'public', 'resources');

function getSafePath(relativePath: string): string {
  // Normalize and prevent directory traversal
  const normalized = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const resolved = path.join(RESOURCES_BASE, normalized);
  if (!resolved.startsWith(RESOURCES_BASE)) {
    throw new Error('Invalid path traversal attempt');
  }
  return resolved;
}

export async function uploadResourceFile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const folder = (formData.get('folder') as string) || '';
  const file = formData.get('file') as File | null;

  if (!file || file.size === 0) {
    return { success: false, error: 'Please select a valid file to upload.' };
  }

  try {
    const destDir = getSafePath(folder);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const safeName = file.name.replace(/[^\w\s\.-]/gi, '_');
    const destFile = path.join(destDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destFile, buffer);

    revalidatePath('/resources');
    revalidatePath('/admin/resources');
    return { success: true };
  } catch (err: any) {
    console.error('[uploadResourceFile] Error:', err);
    return { success: false, error: err?.message || 'Failed to upload file.' };
  }
}

export async function createResourceFolder(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const parentFolder = (formData.get('parentFolder') as string) || '';
  const folderName = (formData.get('folderName') as string) || '';

  if (!folderName.trim()) {
    return { success: false, error: 'Folder name cannot be empty.' };
  }

  try {
    const safeFolderName = folderName.trim().replace(/[^\w\s\.-]/gi, '_');
    const targetDir = getSafePath(path.join(parentFolder, safeFolderName));

    if (fs.existsSync(targetDir)) {
      return { success: false, error: 'A folder with this name already exists.' };
    }

    fs.mkdirSync(targetDir, { recursive: true });

    revalidatePath('/resources');
    revalidatePath('/admin/resources');
    return { success: true };
  } catch (err: any) {
    console.error('[createResourceFolder] Error:', err);
    return { success: false, error: err?.message || 'Failed to create folder.' };
  }
}

export async function deleteResourceItem(itemPath: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  if (!itemPath) {
    return { success: false, error: 'Path is required.' };
  }

  try {
    const target = getSafePath(itemPath);

    if (!fs.existsSync(target)) {
      return { success: false, error: 'Item not found.' };
    }

    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      fs.rmSync(target, { recursive: true, force: true });
    } else {
      fs.unlinkSync(target);
    }

    revalidatePath('/resources');
    revalidatePath('/admin/resources');
    return { success: true };
  } catch (err: any) {
    console.error('[deleteResourceItem] Error:', err);
    return { success: false, error: err?.message || 'Failed to delete item.' };
  }
}
