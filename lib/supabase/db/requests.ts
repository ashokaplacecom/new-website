import { createAdminClient } from '../server'

export async function hasPendingRequest(studentId: number): Promise<boolean> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('verifications')
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
        .schema('requests')
        .from('verifications')
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


export type RequestStatus = 'approved' | 'rejected'  // matches DB enum exactly (lowercase)

export interface ModifyRequestPayload {
    requestId: number
    status: RequestStatus
    pocNote: string
    pocId: number      // FK to verifications.pocs.id — who is taking this action
}

export async function getRequestById(requestId: number) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('verifications')
        .select(`
      id,
      status,
      is_emergency,
      student_message,
      student,
      poc_note,
      modified_by
    `)
        .eq('id', requestId)
        .single()

    if (error) throw new Error(`getRequestById: ${error.message}`)
    return data
}

export async function modifyRequest(payload: ModifyRequestPayload): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .schema('requests')
        .from('verifications')
        .update({
            status: payload.status,
            poc_note: payload.pocNote?.trim() || null,
            modified_at: new Date().toISOString(),
            modified_by: payload.pocId,
        })
        .eq('id', payload.requestId)
        .eq('status', 'pending')  // safety: only modify if still pending, never overwrite a closed request

    if (error) throw new Error(`modifyRequest: ${error.message}`)
}

export async function getLatestRequest(studentId: number) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('verifications')
        .select(`
            request_at,
            modified_at,
            modified_by,
            status,
            student_message,
            poc_note,
            is_emergency
        `)
        .eq('student', studentId)
        .order('request_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) throw new Error(`getLatestRequest: ${error.message}`)
    return data
}

export async function getArchivedRequests(studentId: number) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('verifications')
        .select(`
            request_at,
            modified_at,
            modified_by,
            status,
            student_message,
            poc_note,
            is_emergency
        `)
        .eq('student', studentId)
        .order('request_at', { ascending: false })
        .limit(10)

    if (error) throw new Error(`getArchivedRequests: ${error.message}`)
    return data || []
}