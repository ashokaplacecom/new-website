import { NextRequest, NextResponse } from 'next/server'
import { getStudentByEmail, setStudentOTP } from '@/lib/supabase/db/students'
import { hasPendingRequest } from '@/lib/supabase/db/requests'
import { logAuditTrail } from '@/lib/supabase/db/audit'
import { sendMail } from '@/app/api/_lib/mailer'
import { otpEmail } from '@/content/emails/templates/otp_email'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json()
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }
        const email = body.email?.trim()
        const ALLOWED_EMAIL = "soham.tulsyan_ug2023@ashoka.edu.in"

        // Input validation
        if (!email || email !== ALLOWED_EMAIL) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: email.' },
                { status: 400 }
            )
        }

        // Check student exists
        const student = await getStudentByEmail(email)
        
        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Email not found in our database. Please contact admin.' },
                { status: 404 }
            )
        }

        // Check for existing pending request
        const pending = await hasPendingRequest(student.id)
        if (pending) {
            return NextResponse.json(
                { success: false, message: 'You already have a pending request. Please wait for it to be reviewed.' },
                { status: 409 }
            )
        }

        // Generate and store OTP
        const otp = generateOTP()
        await setStudentOTP(student.id, otp)

        console.log(`[POST /api/duperset/otp/generate] Sending OTP email to ${email}...`)
        // Send email
        const mailResult = await sendMail({
            to: email,
            template: otpEmail({ name: student.name, otp }),
        })
        console.log(`[POST /api/duperset/otp/generate] Mail sent successfully:`, mailResult)

        try {
            await logAuditTrail(student.id, 'OTP_GENERATED', { email })
        } catch (auditErr) {
            console.error('[POST /api/duperset/otp/generate] Failed to log audit trail:', auditErr)
            // We ignore audit trail failures so the user still gets a success response
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully.' })

    } catch (err: any) {
        console.error('[POST /api/duperset/otp/generate]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/otp/generate Endpoint Running' })
}