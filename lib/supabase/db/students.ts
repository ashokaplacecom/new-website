import { createClient, createAdminClient } from '../server'

// Check student exists and has no pending request
export async function getStudentByEmail(email: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('students')
        .select(`
      id,
      name,
      email,
      emergencies_remaining,
      poc,
      otp,
      otp_expiry
    `)
        .eq('email', email)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null // No rows found
        }
        console.error('getStudentByEmail error:', error)
        throw new Error(error.message)
    }
    return data
}

// Write OTP and expiry onto the student row
export async function setStudentOTP(studentId: number, otp: string) {
    const supabase = createAdminClient()

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    const { error } = await supabase
        .from('students')
        .update({
            otp: parseInt(otp),
            otp_expiry: expiresAt.toISOString(),
        })
        .eq('id', studentId)

    if (error) throw new Error(`setStudentOTP: ${error.message}`)
}

// Clear OTP after successful verification
export async function clearStudentOTP(studentId: number) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('students')
        .update({ otp: null, otp_expiry: null })
        .eq('id', studentId)

    if (error) throw new Error(`clearStudentOTP: ${error.message}`)
}