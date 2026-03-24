import { NextRequest, NextResponse } from 'next/server'
import { getStudentByEmail } from '@/lib/supabase/db/students'
import { getLatestMajorMinorRequest } from '@/lib/supabase/db/major_minor_requests'

export async function POST(req: NextRequest) {
    try {
        let body: { email?: string }
        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }

        const email = body.email?.trim()
        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: email.' },
                { status: 400 }
            )
        }

        const student = await getStudentByEmail(email)
        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Email not found in our database.' },
                { status: 404 }
            )
        }

        const request = await getLatestMajorMinorRequest(student.id)

        if (!request) {
            return NextResponse.json({ success: true, data: null })
        }

        // If the request is older than 7 days, return null
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        if (new Date(request.created_at) < oneWeekAgo) {
            return NextResponse.json({ success: true, data: null })
        }

        const data = {
            raised_at: request.created_at,
            modified_at: request.modified_at || null,
            modified_by: request.modified_by || null,
            status: request.status
        }

        return NextResponse.json({ success: true, data })

    } catch (err: any) {
        console.error('[POST /api/duperset/major-minor-change/status]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/major-minor-change/status endpoint running. Send POST with email.' })
}
