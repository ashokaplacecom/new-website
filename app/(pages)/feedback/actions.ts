'use server';

import { z } from 'zod';
import { sendMail } from '@/app/api/_lib/mailer';
import { feedbackInboundEmail } from '@/content/emails/templates/feedback_inbound';
import { uploadFile } from '@/lib/supabase/storage/upload';
import { createClient } from '@/lib/supabase/server';

const feedbackSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    issueType: z.string().min(2),
    description: z.string().min(5),
});

export type FeedbackFormState =
    | { status: 'idle' }
    | { status: 'success' }
    | { status: 'error'; message: string };

export async function sendFeedbackEmail(
    formData: FormData
): Promise<FeedbackFormState> {
    const input = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        issueType: formData.get('issueType'),
        description: formData.get('description'),
    };

    const parsed = feedbackSchema.safeParse(input);
    if (!parsed.success) {
        return {
            status: 'error',
            message: 'Invalid form data. Please check your inputs and try again.',
        };
    }

    const { fullName, email, issueType, description } = parsed.data;

    let attachmentUrl: string | null = null;
    const documentFile = formData.get('document') as File | null;

    if (documentFile && documentFile.size > 0) {
        try {
            const timestamp = Date.now();
            const safeName = documentFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filePath = `feedback/${timestamp}-${safeName}`;

            const uploaded = await uploadFile({
                bucket: 'opportunity-jds', // Reusing this bucket since it's already public and working
                path: filePath,
                file: documentFile,
                contentType: documentFile.type || undefined,
                admin: true,
            });

            const supabase = await createClient();
            const { data: { publicUrl } } = supabase.storage
                .from('opportunity-jds')
                .getPublicUrl(uploaded.path);
            
            attachmentUrl = publicUrl;
        } catch (uploadErr: any) {
            console.error('[sendFeedbackEmail] File upload failed:', uploadErr);
        }
    }

    const recipient = process.env.CONTACT_EMAIL_RECIPIENT || 'connect.placecom@ashoka.edu.in';

    const template = feedbackInboundEmail({
        fullName: fullName || 'Anonymous',
        email: email || 'No email provided',
        issueType: issueType || 'General Feedback',
        description: description || '',
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
            fromAlias: `${fullName || 'Anonymous'} (Feedback)`,
        });

        return { status: 'success' };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred.';
        console.error('[sendFeedbackEmail] Failed:', message);
        return { status: 'error', message: `Failed to send your feedback: ${message}` };
    }
}
