"use server";

import { headers } from "next/headers";

async function getBaseUrl() {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
}

export async function fetchExternalOpportunitiesAction() {
    const baseUrl = await getBaseUrl();
    const apiKey = process.env.API_KEY_FRONTEND || process.env.API_KEY_WEB_EXTENSION || "";

    const res = await fetch(`${baseUrl}/api/duperset/external-opportunities`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        cache: "no-store", // Ensure fresh data on every load
    });

    if (!res.ok) {
        return { success: false, opportunities: [] };
    }

    const data = await res.json().catch(() => ({ success: false, opportunities: [] }));
    return data;
}
