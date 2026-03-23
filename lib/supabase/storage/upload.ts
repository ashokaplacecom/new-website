import { createClient, createAdminClient } from '../server'

interface UploadOptions {
    bucket: string
    path: string          // e.g. 'avatars/user-123.png'
    file: File | Blob | ArrayBuffer
    contentType?: string
    upsert?: boolean      // overwrite if exists, default false
    admin?: boolean       // bypass RLS on upload
}

interface UploadResult {
    path: string
    fullPath: string
}

// Upload a file to a bucket
export async function uploadFile({
    bucket,
    path,
    file,
    contentType,
    upsert = false,
    admin = false,
}: UploadOptions): Promise<UploadResult> {
    const supabase = admin ? createAdminClient() : await createClient()

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            contentType,
            upsert,
        })

    if (error) throw new Error(`uploadFile: ${error.message}`)
    return data
}

// Delete one or more files from a bucket
export async function deleteFiles(bucket: string, paths: string[]): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage
        .from(bucket)
        .remove(paths)

    if (error) throw new Error(`deleteFiles: ${error.message}`)
}

// Move / rename a file within a bucket
export async function moveFile(
    bucket: string,
    fromPath: string,
    toPath: string
): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

    if (error) throw new Error(`moveFile: ${error.message}`)
}

// Replace an existing file (upsert shorthand)
export async function replaceFile(
    options: Omit<UploadOptions, 'upsert'>
): Promise<UploadResult> {
    return uploadFile({ ...options, upsert: true })
}