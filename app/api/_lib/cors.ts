import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
    'https://your-frontend.vercel.app',
    'chrome-extension://YOUR_EXTENSION_ID',
]

export function withCors(req: NextRequest, res: NextResponse): NextResponse {
    const origin = req.headers.get('origin') ?? ''

    if (ALLOWED_ORIGINS.includes(origin)) {
        res.headers.set('Access-Control-Allow-Origin', origin)
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
    }

    return res
}

export function handlePreflight(req: NextRequest): NextResponse | null {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.get('origin') ?? ''
        if (ALLOWED_ORIGINS.includes(origin)) {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                },
            })
        }
        return new NextResponse(null, { status: 403 })
    }
    return null
}