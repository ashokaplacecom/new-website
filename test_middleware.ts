import { NextResponse } from 'next/server';
export function middleware(req) {
    if (req.nextUrl.pathname.endsWith('/')) {
        console.log('MIDDLEWARE SAW TRAILING SLASH');
    }
    return NextResponse.next();
}
