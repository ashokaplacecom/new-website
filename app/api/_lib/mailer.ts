import type { TemplateResult } from '@/content/emails/types';

interface SendMailOptions {
    to: string;
    template: TemplateResult;
    fromAlias?: string;
    cc?: string;
    bcc?: string;
}

export async function sendMail({ to, template, fromAlias, cc, bcc }: SendMailOptions) {
    const url = `https://script.google.com/macros/s/${process.env.EMAIL_API_DEPLOYMENT_ID}/exec`;

    const body = new URLSearchParams({
        key: process.env.API_KEY_WEB_EXTENSION || process.env.API_KEY_FRONTEND!,
        to_email: to,
        email_subject: template.subject,
        email_body: template.html,
        ...(fromAlias && { from_alias: fromAlias }),
        ...(cc && { cc }),
        ...(bcc && { bcc }),
    });

    console.log(`[sendMail] Fetching ${url} for ${to}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            redirect: 'follow',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log(`[send_mail] Response:`, data);

        if (!data.success) {
            throw new Error(`Mail failed [${data.status}]: ${data.message}`);
        }

        return data;
    } catch (err: any) {
        clearTimeout(timeoutId);
        
        if (err.name === 'AbortError') {
            console.error(`[sendMail] Timeout of 60s reached for ${to}. Email might still be processed by GAS but we stopped waiting.`);
            throw new Error(`Email sender timed out after 60 seconds.`);
        }
        
        console.error(`[sendMail] Error sending to ${to}:`, err);
        throw err;
    }
}