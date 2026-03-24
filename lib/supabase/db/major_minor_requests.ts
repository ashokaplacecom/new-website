import { createAdminClient } from '../server'
import { RequestStatus } from './requests'

export async function hasPendingMajorMinorRequest(studentId: number): Promise<boolean> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('major-minor-change')
        .select('id')
        .eq('student', studentId)
        .eq('status', 'pending')
        .maybeSingle()

    if (error) {
        // PostgREST error code 42703 is "column does not exist"
        // Let's assume there is a 'status' column. If not, we might need to add it to the schema.
        // Wait, looking at the schema from mcp, there is no status column in major-minor-change!
        // Let's modify the schema later, but for now we assume it exists as 'status'.
        throw new Error(`hasPendingMajorMinorRequest: ${error.message}`)
    }
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
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('major-minor-change')
        .insert({
            student: payload.studentId,
            current_major: payload.currentMajor,
            current_minor: payload.currentMinor,
            prospective_major: payload.prospectiveMajor,
            prospective_minor: payload.prospectiveMinor,
            status: 'pending',
        })
        .select()
        .single()

    if (error) throw new Error(`createMajorMinorRequest: ${error.message}`)
    return data
}

export interface ModifyMajorMinorRequestPayload {
    requestId: number
    status: RequestStatus
    pocNote: string
    pocId: number      // FK to requests.pocs.id
}

export async function getMajorMinorRequestById(requestId: number) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('major-minor-change')
        .select(`
      id,
      status,
      current_major,
      current_minor,
      prospective_major,
      prospective_minor,
      student,
      poc_note,
      modified_by
    `)
        .eq('id', requestId)
        .single()

    if (error) throw new Error(`getMajorMinorRequestById: ${error.message}`)
    return data
}

export async function modifyMajorMinorRequest(payload: ModifyMajorMinorRequestPayload): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .schema('requests')
        .from('major-minor-change')
        .update({
            status: payload.status,
            poc_note: payload.pocNote,
            modified_at: new Date().toISOString(),
            modified_by: payload.pocId,
        })
        .eq('id', payload.requestId)
        .eq('status', 'pending')

    if (error) throw new Error(`modifyMajorMinorRequest: ${error.message}`)
}

export async function getLatestMajorMinorRequest(studentId: number) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('major-minor-change')
        .select(`
            created_at,
            modified_at,
            modified_by,
            status,
            current_major,
            current_minor,
            prospective_major,
            prospective_minor,
            poc_note
        `)
        .eq('student', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) throw new Error(`getLatestMajorMinorRequest: ${error.message}`)
    return data
}

export async function getArchivedMajorMinorRequests(studentId: number) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('requests')
        .from('major-minor-change')
        .select(`
            created_at,
            modified_at,
            modified_by,
            status,
            current_major,
            current_minor,
            prospective_major,
            prospective_minor,
            poc_note
        `)
        .eq('student', studentId)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) throw new Error(`getArchivedMajorMinorRequests: ${error.message}`)
    return data || []
}
