import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key')

    const VALID_API_KEYS = new Set([
        process.env.API_KEY_WEB_EXTENSION,
        process.env.API_KEY_FRONTEND,
    ])

    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*'],  // only protect /api/* routes
}