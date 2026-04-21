import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const GITHUB_API_BASE = 'https://api.github.com';

type RouteParams = Promise<{ path: string[] }>;

/**
 * This proxy allows Decap CMS to talk to GitHub without requiring 
 * individual users to log in with their personal GitHub accounts.
 * It uses a single server-side GITHUB_TOKEN instead.
 */
export async function GET(req: NextRequest, { params }: { params: RouteParams }) {
    return handleRequest(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: RouteParams }) {
    return handleRequest(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: RouteParams }) {
    return handleRequest(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: RouteParams }) {
    return handleRequest(req, await params);
}

async function handleRequest(req: NextRequest, params: { path: string[] }) {
    const session = await auth();

    // 1. Authorization: Only admins can use the Git Proxy
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        return NextResponse.json({ error: 'GITHUB_TOKEN not configured on server' }, { status: 500 });
    }

    // 2. Handle internal Git Gateway endpoints
    const originalUrl = new URL(req.url);
    const apiPath = '/' + params.path.join('/');

    // Decap CMS checks /settings and /user on the gateway before starting
    if (apiPath === '/settings') {
        return NextResponse.json({
            github_enabled: true,
            github_owner: 'ashokaplacecom',
            github_repo: 'new-website'
        });
    }

    if (apiPath === '/user') {
        return NextResponse.json({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            avatar_url: session.user.image,
            roles: ['admin']
        });
    }

    // 3. Resolve the GitHub API URL
    // CMS sends: /api/cms/proxy/github/repos/owner/repo/contents/...
    // We transform it into the real GitHub API call using params.path
    
    // Decap CMS might prefix with /github/
    const targetPath = apiPath.startsWith('/github') ? apiPath.replace('/github', '') : apiPath;
    const targetUrl = `${GITHUB_API_BASE}${targetPath}${originalUrl.search}`;

    try {
        const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined;

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': req.headers.get('Content-Type') || 'application/json',
                'User-Agent': 'PlaceCom-CMS-Proxy',
            },
            body,
        });

        // Some GitHub responses (like 204 No Content) don't have a body
        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[CMS Proxy Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}
