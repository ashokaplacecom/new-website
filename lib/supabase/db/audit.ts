import { createAdminClient } from '../server'

export async function logAuditTrail(userId: number, action: string, metadata: any = {}) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('audit_trail')
        .insert({
            user_id: userId,
            action,
            metadata
        })

    if (error) throw new Error(`logAuditTrail: ${error.message}`)
}
