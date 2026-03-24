import { createAdminClient } from '../server'

export interface POC {
    id: number
    poc_name: string
    email: string
}

export async function getPOCByStudentId(studentId: number): Promise<POC | null> {
    const supabase = createAdminClient()

    // 1. Get the POC id from the students table in public schema
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('poc')
        .eq('id', studentId)
        .single()

    if (studentError || !student?.poc) {
        console.error('getPOCByStudentId: Student or POC ID not found', studentError)
        return null
    }

    // 2. Get the POC details from the pocs table in verifications schema
    const { data: poc, error: pocError } = await supabase
        .schema('verifications')
        .from('pocs')
        .select('id, poc_name, email')
        .eq('id', student.poc)
        .single()

    if (pocError) {
        console.error('getPOCByStudentId: POC details fetch failed', pocError)
        return null
    }

    return poc as POC
}

export async function getPOCById(pocId: number): Promise<POC | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .schema('verifications')
        .from('pocs')
        .select('id, poc_name, email')
        .eq('id', pocId)
        .single()

    if (error) return null
    return data
}