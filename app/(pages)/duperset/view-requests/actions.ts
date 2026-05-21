"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";

async function getBaseUrl() {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
}

function getApiKey() {
    return process.env.API_KEY_FRONTEND || process.env.API_KEY_WEB_EXTENSION || "";
}

export async function fetchMyRequestsAction() {
    const session = await auth();
    if (!session?.user?.email) {
        return null;
    }
    
    const email = session.user.email;
    const baseUrl = await getBaseUrl();
    const apiKey = getApiKey();

    const fetchWithApiKey = (url: string) =>
        fetch(`${baseUrl}${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
            body: JSON.stringify({ email }),
            cache: "no-store"
        }).then((r) => r.json().catch(() => ({ data: null })));

    const [verStatus, verArchives, mmStatus, mmArchives] = await Promise.all([
        fetchWithApiKey("/api/duperset/verifications/status"),
        fetchWithApiKey("/api/duperset/verifications/archives"),
        fetchWithApiKey("/api/duperset/major-minor-change/status"),
        fetchWithApiKey("/api/duperset/major-minor-change/archives"),
    ]);

    return {
        verifications: {
            active: verStatus?.data || null,
            archives: verArchives?.data || [],
        },
        majorMinor: {
            active: mmStatus?.data || null,
            archives: mmArchives?.data || [],
        },
    };
}
