import prisma from '@/lib/prisma'

export async function hasPendingRequest(studentId: number): Promise<boolean> {
    const data = await prisma.verifications.findFirst({
        where: {
            student: BigInt(studentId),
            status: 'pending'
        },
        select: { id: true }
    })

    return data !== null
}

export interface CreateRequestPayload {
    studentId: number
    studentMessage: string
    isEmergency: boolean
    deadline: Date
}

export interface CreatedRequest {
    id: number
    requested_at: string
    student: number
    status: string
    student_message: string
    is_emergency: boolean
}

export async function createRequest(payload: CreateRequestPayload): Promise<CreatedRequest> {
    try {
        const data = await prisma.verifications.create({
            data: {
                student: BigInt(payload.studentId),
                student_message: payload.studentMessage,
                is_emergency: payload.isEmergency,
                status: 'pending',
                deadline: payload.deadline
            }
        })
        
        return {
            id: Number(data.id),
            requested_at: data.request_at.toISOString(),
            student: Number(data.student),
            status: data.status || 'pending',
            student_message: data.student_message || '',
            is_emergency: data.is_emergency
        }
    } catch (error: any) {
        throw new Error(`createRequest: ${error.message}`)
    }
}

export type RequestStatus = 'approved' | 'rejected'

export interface ModifyRequestPayload {
    requestId: number
    status: RequestStatus
    pocNote: string
    pocId: number
}

export async function getRequestById(requestId: number) {
    try {
        const data = await prisma.verifications.findUnique({
            where: { id: BigInt(requestId) },
            select: {
                id: true,
                status: true,
                is_emergency: true,
                student_message: true,
                student: true,
                poc_note: true,
                modified_by: true
            }
        })
        
        if (!data) return null;
        
        return {
            ...data,
            id: Number(data.id),
            student: data.student ? Number(data.student) : null,
            modified_by: data.modified_by ? Number(data.modified_by) : null
        }
    } catch (error: any) {
        throw new Error(`getRequestById: ${error.message}`)
    }
}

export async function modifyRequest(payload: ModifyRequestPayload): Promise<void> {
    try {
        await prisma.verifications.updateMany({
            where: { 
                id: BigInt(payload.requestId),
                status: 'pending'
            },
            data: {
                status: payload.status as any,
                poc_note: payload.pocNote?.trim() || null,
                modified_at: new Date(),
                modified_by: BigInt(payload.pocId)
            }
        })
    } catch (error: any) {
        throw new Error(`modifyRequest: ${error.message}`)
    }
}

export async function getLatestRequest(studentId: number) {
    try {
        const data = await prisma.verifications.findFirst({
            where: { student: BigInt(studentId) },
            orderBy: { request_at: 'desc' },
            select: {
                request_at: true,
                modified_at: true,
                modified_by: true,
                status: true,
                student_message: true,
                poc_note: true,
                is_emergency: true,
                deadline: true
            }
        })
        
        if (!data) return null;
        
        return {
            ...data,
            modified_by: data.modified_by ? Number(data.modified_by) : null
        }
    } catch (error: any) {
        throw new Error(`getLatestRequest: ${error.message}`)
    }
}

export async function getArchivedRequests(studentId: number) {
    try {
        const data = await prisma.verifications.findMany({
            where: { 
                student: BigInt(studentId),
                status: { not: 'pending' }
            },
            orderBy: { request_at: 'desc' },
            take: 10,
            select: {
                request_at: true,
                modified_at: true,
                modified_by: true,
                status: true,
                student_message: true,
                poc_note: true,
                is_emergency: true
            }
        })
        
        return data.map((req: any) => ({
            ...req,
            modified_by: req.modified_by ? Number(req.modified_by) : null
        }))
    } catch (error: any) {
        throw new Error(`getArchivedRequests: ${error.message}`)
    }
}