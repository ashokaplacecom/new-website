import { NextRequest, NextResponse } from 'next/server'
import { getStudentByEmail } from '@/lib/supabase/db/students'
import { getArchivedRequests } from '@/lib/supabase/db/requests'

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

        const requests = await getArchivedRequests(student.id)

        const data = requests.map((req: any) => ({
            raised_at: req.request_at,
            modified_at: req.modified_at || null,
            modified_by: req.modified_by || null,
            status: req.status
        }))

        return NextResponse.json({ success: true, data })

    } catch (err: any) {
        console.error('[POST /api/duperset/request/archives]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/request/archives endpoint running.' })
}
