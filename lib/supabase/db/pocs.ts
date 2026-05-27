import prisma from '@/lib/prisma'

export interface POC {
    id: number
    poc_name: string
    email: string
}

export async function getPOCByStudentId(studentId: number): Promise<POC | null> {
    const student = await prisma.students.findUnique({
        where: { id: BigInt(studentId) },
        select: { poc: true }
    })

    if (!student?.poc) {
        return null
    }

    const poc = await prisma.pocs.findUnique({
        where: { id: student.poc },
        select: { id: true, poc_name: true, email: true }
    })

    if (!poc) {
        return null
    }

    return {
        id: Number(poc.id),
        poc_name: poc.poc_name || '',
        email: poc.email || ''
    }
}

export async function getPOCById(pocId: number): Promise<POC | null> {
    const poc = await prisma.pocs.findUnique({
        where: { id: BigInt(pocId) },
        select: { id: true, poc_name: true, email: true }
    })

    if (!poc) return null
    return {
        id: Number(poc.id),
        poc_name: poc.poc_name || '',
        email: poc.email || ''
    }
}

export async function getLeadershipPOCs(): Promise<POC[]> {
    try {
        const pocs = await prisma.pocs.findMany({
            where: { role: 'leadership' },
            select: { id: true, poc_name: true, email: true }
        })
        
        return pocs.map(poc => ({
            id: Number(poc.id),
            poc_name: poc.poc_name || '',
            email: poc.email || ''
        }))
    } catch (error) {
        console.error('getLeadershipPOCs error:', error)
        return []
    }
}