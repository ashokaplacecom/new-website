'use server';

import { z } from 'zod';
import { sendMail } from '@/app/api/_lib/mailer';
import { recruiterInboundEmail } from '@/content/emails/templates/recruiter_inbound';
import { uploadFile } from '@/lib/supabase/storage/upload';
import { createClient } from '@/lib/supabase/server';

const recruiterSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    company: z.string().min(2),
    opportunityType: z.string().min(2),
    subject: z.string().optional(),
    message: z.string().min(10),
});

export type RecruiterFormState =
    | { status: 'idle' }
    | { status: 'success' }
    | { status: 'error'; message: string };

export async function sendRecruiterEmail(
    formData: FormData
): Promise<RecruiterFormState> {
    // Validate
    const input = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        company: formData.get('company'),
        opportunityType: formData.get('opportunityType'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    };

    const parsed = recruiterSchema.safeParse(input);
    if (!parsed.success) {
        return {
            status: 'error',
            message: 'Invalid form data. Please check your inputs and try again.',
        };
    }

    const { fullName, email, company, opportunityType, subject, message } = parsed.data;

    // Handle File Upload if present
    let attachmentUrl: string | null = null;
    const documentFile = formData.get('document') as File | null;

    if (documentFile && documentFile.size > 0) {
        try {
            const timestamp = Date.now();
            const safeName = documentFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filePath = `recruiters/${timestamp}-${safeName}`;

            const uploaded = await uploadFile({
                bucket: 'opportunity-jds',
                path: filePath,
                file: documentFile,
                contentType: documentFile.type || undefined,
                admin: true,
            });

            // Get public URL
            const supabase = await createClient();
            const { data: { publicUrl } } = supabase.storage
                .from('opportunity-jds')
                .getPublicUrl(uploaded.path);
            
            attachmentUrl = publicUrl;
        } catch (uploadErr: any) {
            console.error('[sendRecruiterEmail] File upload failed:', uploadErr);
            // We can choose to fail the whole form or just skip the attachment. We'll fail it.
            return {
                status: 'error',
                message: 'Failed to upload the document. Please try again or submit without it.',
            };
        }
    }

    const recipient = process.env.CONTACT_EMAIL_RECIPIENT; // connect.placecom@ashoka.edu.in
    if (!recipient) {
        console.error('[sendRecruiterEmail] CONTACT_EMAIL_RECIPIENT is not set.');
        return {
            status: 'error',
            message: 'Server configuration error. Please try again later.',
        };
    }

    const template = recruiterInboundEmail({
        fullName,
        email,
        company,
        opportunityType,
        subject,
        message,
        attachmentUrl,
        submittedAt: new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'long',
            timeStyle: 'short',
        }),
    });

    try {
        await sendMail({
            to: recipient,
            template,
            fromAlias: `${fullName} (${company})`,
        });

        return { status: 'success' };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'Unknown error occurred.';
        console.error('[sendRecruiterEmail] Failed:', message);

        return {
            status: 'error',
            message: `Failed to send your message: ${message}`,
        };
    }
}
