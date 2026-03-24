import { createAdminClient } from '../server'

export async function hasPendingRequest(studentId: number): Promise<boolean> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('verifications')
        .from('requests')
        .select('id')
        .eq('student', studentId)
        .eq('status', 'pending')
        .maybeSingle()

    if (error) throw new Error(`hasPendingRequest: ${error.message}`)
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
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('verifications')
        .from('requests')
        .insert({
            student: payload.studentId,
            student_message: payload.studentMessage,
            is_emergency: payload.isEmergency,
            status: 'pending',
            deadline: payload.deadline.toISOString()
        })
        .select()
        .single()

    if (error) throw new Error(`createRequest: ${error.message}`)
    return data
}