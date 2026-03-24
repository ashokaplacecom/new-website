import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '../../_lib/mailer'

export async function POST(req: NextRequest) {
    try {
        let body: {
            to?: string
            subject?: string
            html?: string
            fromAlias?: string
            key?: string
        }

        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }

        const { to, subject, html, fromAlias, key } = body

        // Authentication: check against the internal API key
        // Using the same key as the web extension/frontend for now
        const VALID_KEY = process.env.API_KEY_WEB_EXTENSION || process.env.API_KEY_FRONTEND
        
        if (!key || key !== VALID_KEY) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Invalid API key.' },
                { status: 401 }
            )
        }

        // Input validation
        if (!to || !subject || !html) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: to, subject, or html.' },
                { status: 400 }
            )
        }

        // Call the internal mailer lib
        const result = await sendMail({
            to,
            template: {
                subject,
                html
            },
            fromAlias
        })

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully via Gmail abstraction layer.',
            details: result
        })

    } catch (err: any) {
        console.error('[POST /api/gmail/send]', err)
        return NextResponse.json(
            { 
                success: false, 
                message: err.message || 'An unexpected error occurred while sending email.' 
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ 
        success: true, 
        message: 'Gmail Abstraction API Running. Send POST request with key, to, subject, and html payload.' 
    })
}
