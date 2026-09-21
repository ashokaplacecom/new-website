"use server";

import { headers } from "next/headers";

async function getBaseUrl() {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
}

function getApiKey() {
    return process.env.API_KEY_FRONTEND || process.env.API_KEY_WEB_EXTENSION || "";
}

export async function generateOtpAction(email: string) {
    const baseUrl = await getBaseUrl();
    const apiKey = getApiKey();

    const res = await fetch(`${baseUrl}/api/duperset/otp/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return data || { success: false, message: "Failed to generate OTP" };
    }

    return data;
}

export async function verifyOtpAndCreateVerificationAction(params: {
    email: string;
    otp: string;
    message?: string;
    isEmergency?: boolean;
}) {
    const baseUrl = await getBaseUrl();
    const apiKey = getApiKey();

    // 1. Verify OTP
    const verifyRes = await fetch(`${baseUrl}/api/duperset/otp/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        body: JSON.stringify({ email: params.email, otp: params.otp }),
    });

    const verifyData = await verifyRes.json().catch(() => null);

    if (!verifyRes.ok) {
        return verifyData || { success: false, message: "Invalid OTP" };
    }

    // 2. Create Verification Request
    const createRes = await fetch(`${baseUrl}/api/duperset/verifications/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        body: JSON.stringify({
            email: params.email,
            message: params.message,
            isEmergency: params.isEmergency || false,
        }),
    });

    const createData = await createRes.json().catch(() => null);

    if (!createRes.ok) {
        return createData || { success: false, message: "Failed to create verification request" };
    }

    return createData;
}
