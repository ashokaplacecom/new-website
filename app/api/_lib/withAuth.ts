import { NextRequest, NextResponse } from 'next/server'

type Handler = (req: NextRequest) => Promise<NextResponse>

export function withAuth(handler: Handler): Handler {
    return async (req) => {
        // Middleware already handles this, but this is a safety net
        const apiKey = req.headers.get('x-api-key')
        if (!apiKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return handler(req)
    }
}