import prisma from '@/lib/prisma'

// Check student exists and has no pending request
export async function getStudentByEmail(email: string) {
    const data = await prisma.students.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            emergencies_remaining: true,
            poc: true,
            otp: true,
            otp_expiry: true
        }
    })

    if (!data) return null

    return {
        ...data,
        id: Number(data.id),
        poc: data.poc ? Number(data.poc) : null
    }
}

export async function getStudentById(id: number) {
    const data = await prisma.students.findUnique({
        where: { id: BigInt(id) },
        select: {
            id: true,
            name: true,
            email: true,
            emergencies_remaining: true,
            major_minor_change_count: true,
            poc: true,
            otp: true,
            otp_expiry: true
        }
    })

    if (!data) return null

    return {
        ...data,
        id: Number(data.id),
        "major-minor-change-count": data.major_minor_change_count,
        poc: data.poc ? Number(data.poc) : null
    }
}

// Write OTP and expiry onto the student row
export async function setStudentOTP(studentId: number, otp: string) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    try {
        await prisma.students.update({
            where: { id: BigInt(studentId) },
            data: {
                otp: parseInt(otp),
                otp_expiry: expiresAt
            }
        })
    } catch (error: any) {
        throw new Error(`setStudentOTP: ${error.message}`)
    }
}

// Clear OTP after successful verification
export async function clearStudentOTP(studentId: number) {
    try {
        await prisma.students.update({
            where: { id: BigInt(studentId) },
            data: {
                otp: null,
                otp_expiry: null
            }
        })
    } catch (error: any) {
        throw new Error(`clearStudentOTP: ${error.message}`)
    }
}

export async function decrementEmergencies(studentId: number): Promise<void> {
    try {
        await prisma.students.update({
            where: { id: BigInt(studentId) },
            data: {
                emergencies_remaining: { decrement: 1 }
            }
        })
    } catch (error: any) {
        throw new Error(`decrementEmergencies: ${error.message}`)
    }
}

export async function decrementMajorMinorCount(studentId: number): Promise<void> {
    try {
        await prisma.students.update({
            where: { id: BigInt(studentId) },
            data: {
                major_minor_change_count: { decrement: 1 }
            }
        })
    } catch (error: any) {
        throw new Error(`decrementMajorMinorCount: ${error.message}`)
    }
}