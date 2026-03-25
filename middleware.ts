import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key')

    const isWebExtension = apiKey === process.env.API_KEY_WEB_EXTENSION;
    const isFrontend = apiKey === process.env.API_KEY_FRONTEND;

    if (!apiKey || (!isWebExtension && !isFrontend)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isWebExtension) {
        const origin = req.headers.get('origin')
        if (origin !== process.env.ALLOWED_EXTENSION_ORIGIN) {
            return NextResponse.json({ error: 'Unauthorized Origin' }, { status: 401 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*'],  // only protect /api/* routes
}