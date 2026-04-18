import { NextRequest, NextResponse } from 'next/server'

// Add all permitted extension/frontend origins here
const ALLOWED_ORIGINS = [
    'https://app.joinsuperset.com',
    'chrome-extension://debmlfjpofnpjlafiicfcgdmfgkpaaoj'
]

export function middleware(req: NextRequest) {
    const origin = req.headers.get('origin') ?? ''
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost')

    // 1. Handle CORS Preflight (OPTIONS) - MUST happen before auth checks
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
            },
        })
    }

    // 2. Auth Check
    const apiKey = req.headers.get('x-api-key')
    const isWebExtension = apiKey === process.env.API_KEY_WEB_EXTENSION;
    const isFrontend = apiKey === process.env.API_KEY_FRONTEND;

    if (!apiKey || (!isWebExtension && !isFrontend)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isWebExtension) {
        if (origin !== process.env.ALLOWED_EXTENSION_ORIGIN && !isAllowedOrigin) {
            return NextResponse.json({ error: 'Unauthorized Origin' }, { status: 401 })
        }
    }

    // 3. Attach CORS headers to actual response
    const response = NextResponse.next()

    if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
    }

    return response
}

export const config = {
    matcher: ['/api/:path*'],
}