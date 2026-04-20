"use server";
import { createAdminClient } from "@/lib/supabase/server";

function getBaseUrl() {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

export async function fetchAllPOCs() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.schema("requests").from("pocs").select("poc_name");
        if (error) throw error;
        return data?.map(d => d.poc_name) || [];
    } catch (e: any) {
        console.error("fetchAllPOCs Error:", e);
        return [];
    }
}

export async function fetchDashboardRequests() {
    try {
        const res = await fetch(`${getBaseUrl()}/api/duperset/pocs/dashboard`, {
            headers: {
                "x-api-key": process.env.API_KEY_FRONTEND || "",
            },
            cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    } catch (e: any) {
        console.error("fetchDashboardRequests Error:", e);
        return { success: false, message: e.message };
    }
}

export async function modifyRequestAction(
    type: "verification" | "major-minor",
    requestId: number,
    method: "approved" | "rejected",
    pocId: number,
    pocNote: string
) {
    try {
        const url = type === "verification"
            ? `${getBaseUrl()}/api/duperset/verifications/modify`
            : `${getBaseUrl()}/api/duperset/major-minor-change/modify`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "x-api-key": process.env.API_KEY_FRONTEND || "",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ requestId, method, pocId, pocNote }),
        });
        if (!res.ok) {
            const errRes = await res.json().catch(() => ({}));
            throw new Error(`HTTP ${res.status}: ${errRes.message || "Unknown error"}`);
        }
        return res.json();
    } catch (e: any) {
        console.error("modifyRequestAction Error:", e);
        return { success: false, message: e.message };
    }
}
