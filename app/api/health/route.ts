import { NextRequest, NextResponse } from 'next/server'


export async function GET(req: NextRequest) {
    const res = NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
    return res
}