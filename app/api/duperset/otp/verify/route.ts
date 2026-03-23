import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/app/api/_lib/verifyOtp'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function POST(req: NextRequest) {
    try {
        let body
        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }

        const email = body.email?.trim()
        const otp = body.otp?.toString().trim()

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: email, otp.' },
                { status: 400 }
            )
        }

        const result = await verifyOtp(email, otp)

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: result.status }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully.',
            studentId: result.studentId,
        })
    } catch (err: any) {
        console.error('[POST /api/duperset/otp/verify]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/otp/verify Endpoint Running' })
}
