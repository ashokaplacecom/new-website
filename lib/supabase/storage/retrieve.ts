import { createClient, createAdminClient } from '../server'

// Get a permanent public URL — only works if the bucket is set to public
export async function getPublicUrl(bucket: string, path: string): Promise<string> {
    const supabase = await createClient()

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

    return data.publicUrl
}

// Get a temporary signed URL — works for private buckets
// expiresIn is in seconds, default 1 hour
export async function getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

    if (error) throw new Error(`getSignedUrl: ${error.message}`)
    return data.signedUrl
}

// Download a file as a Blob — useful for server-side processing
export async function downloadFile(bucket: string, path: string): Promise<Blob> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
        .from(bucket)
        .download(path)

    if (error) throw new Error(`downloadFile: ${error.message}`)
    return data
}

// List all files in a folder within a bucket
export async function listFiles(bucket: string, folder: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
            sortBy: { column: 'created_at', order: 'desc' },
        })

    if (error) throw new Error(`listFiles: ${error.message}`)
    return data
}