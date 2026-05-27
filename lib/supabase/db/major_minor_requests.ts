import prisma from '@/lib/prisma'
import { RequestStatus } from './requests'

export async function hasPendingMajorMinorRequest(studentId: number): Promise<boolean> {
    const data = await prisma.major_minor_change.findFirst({
        where: {
            student: BigInt(studentId),
            status: 'pending'
        },
        select: { id: true }
    })

    return data !== null
}

export interface CreateMajorMinorRequestPayload {
    studentId: number
    currentMajor?: string | null
    currentMinor?: string | null
    prospectiveMajor?: string | null
    prospectiveMinor?: string | null
}

export interface CreatedMajorMinorRequest {
    id: number
    created_at: string
    student: number
    current_major: string | null
    current_minor: string | null
    prospective_major: string | null
    prospective_minor: string | null
    status: RequestStatus
}

export async function createMajorMinorRequest(payload: CreateMajorMinorRequestPayload): Promise<CreatedMajorMinorRequest> {
    try {
        const data = await prisma.major_minor_change.create({
            data: {
                student: BigInt(payload.studentId),
                current_major: payload.currentMajor,
                current_minor: payload.currentMinor,
                prospective_major: payload.prospectiveMajor,
                prospective_minor: payload.prospectiveMinor,
                status: 'pending'
            }
        })
        
        return {
            id: Number(data.id),
            created_at: data.created_at.toISOString(),
            student: Number(data.student),
            current_major: data.current_major,
            current_minor: data.current_minor,
            prospective_major: data.prospective_major,
            prospective_minor: data.prospective_minor,
            status: (data.status || 'pending') as RequestStatus
        }
    } catch (error: any) {
        throw new Error(`createMajorMinorRequest: ${error.message}`)
    }
}

export interface ModifyMajorMinorRequestPayload {
    requestId: number
    status: RequestStatus
    pocNote: string
    pocId: number
}

export async function getMajorMinorRequestById(requestId: number) {
    try {
        const data = await prisma.major_minor_change.findUnique({
            where: { id: requestId },
            select: {
                id: true,
                status: true,
                current_major: true,
                current_minor: true,
                prospective_major: true,
                prospective_minor: true,
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
        throw new Error(`getMajorMinorRequestById: ${error.message}`)
    }
}

export async function modifyMajorMinorRequest(payload: ModifyMajorMinorRequestPayload): Promise<void> {
    try {
        await prisma.major_minor_change.updateMany({
            where: {
                id: payload.requestId,
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
        throw new Error(`modifyMajorMinorRequest: ${error.message}`)
    }
}

export async function getLatestMajorMinorRequest(studentId: number) {
    try {
        const data = await prisma.major_minor_change.findFirst({
            where: { student: BigInt(studentId) },
            orderBy: { created_at: 'desc' },
            select: {
                created_at: true,
                modified_at: true,
                modified_by: true,
                status: true,
                current_major: true,
                current_minor: true,
                prospective_major: true,
                prospective_minor: true,
                poc_note: true
            }
        })
        
        if (!data) return null;
        
        return {
            ...data,
            modified_by: data.modified_by ? Number(data.modified_by) : null
        }
    } catch (error: any) {
        throw new Error(`getLatestMajorMinorRequest: ${error.message}`)
    }
}

export async function getArchivedMajorMinorRequests(studentId: number) {
    try {
        const data = await prisma.major_minor_change.findMany({
            where: { student: BigInt(studentId) },
            orderBy: { created_at: 'desc' },
            take: 10,
            select: {
                created_at: true,
                modified_at: true,
                modified_by: true,
                status: true,
                current_major: true,
                current_minor: true,
                prospective_major: true,
                prospective_minor: true,
                poc_note: true
            }
        })
        
        return data.map(req => ({
            ...req,
            modified_by: req.modified_by ? Number(req.modified_by) : null
        }))
    } catch (error: any) {
        throw new Error(`getArchivedMajorMinorRequests: ${error.message}`)
    }
}
