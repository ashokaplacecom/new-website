import { getStudentByEmail, clearStudentOTP } from '@/lib/supabase/db/students'

export type VerifyOtpResult =
    | { success: true; studentId: number; studentName: string }
    | { success: false; message: string; status: number }

/**
 * Verifies an OTP for a student by email.
 * 1. Checks student exists
 * 2. Checks an OTP is set on the student record
 * 3. Checks the provided OTP matches
 * 4. Checks the OTP has not expired
 *
 * On success, clears the OTP from the student record.
 * This function is NOT logged on the audit trail.
 */
export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
    // 1. Fetch student by email
    const student = await getStudentByEmail(email)

    if (!student) {
        return { success: false, message: 'Email not found.', status: 404 }
    }

    // 2. Check that an OTP exists on the record
    if (student.otp === null || student.otp_expiry === null) {
        return { success: false, message: 'No OTP has been generated for this account.', status: 400 }
    }

    // 3. Check OTP matches
    if (student.otp !== parseInt(otp)) {
        return { success: false, message: 'Invalid OTP.', status: 401 }
    }

    // 4. Check OTP expiry
    const expiresAt = new Date(student.otp_expiry)
    if (Date.now() > expiresAt.getTime()) {
        return { success: false, message: 'OTP has expired. Please request a new one.', status: 410 }
    }

    // OTP is valid — clear it so it cannot be reused
    await clearStudentOTP(student.id)

    return { success: true, studentId: student.id, studentName: student.name }
}
