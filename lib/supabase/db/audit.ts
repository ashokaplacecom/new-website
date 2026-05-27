import prisma from '@/lib/prisma'

export async function logAuditTrail(userId: number, action: string, metadata: any = {}) {
    try {
        await prisma.audit_trail.create({
            data: {
                user_id: BigInt(userId),
                action,
                metadata
            }
        })
    } catch (error: any) {
        throw new Error(`logAuditTrail: ${error.message}`)
    }
}
