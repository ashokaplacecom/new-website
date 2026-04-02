'use server';

import { z } from 'zod';
import { sendMail } from '@/app/api/_lib/mailer';
import { contactUsEmail } from '@/content/emails/templates/contact_us';

const contactSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    subject: z.string().min(3),
    message: z.string().min(20).max(2000),
});

export type ContactFormState =
    | { status: 'idle' }
    | { status: 'success' }
    | { status: 'error'; message: string };

export async function sendContactEmail(
    input: unknown
): Promise<ContactFormState> {
    // Validate
    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
        return {
            status: 'error',
            message: 'Invalid form data. Please check your inputs and try again.',
        };
    }

    const { fullName, email, subject, message } = parsed.data;

    const recipient = process.env.CONTACT_EMAIL_RECIPIENT;
    if (!recipient) {
        console.error('[sendContactEmail] CONTACT_EMAIL_RECIPIENT is not set.');
        return {
            status: 'error',
            message: 'Server configuration error. Please try again later.',
        };
    }

    const template = contactUsEmail({
        fullName,
        email,
        subject,
        message,
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
            fromAlias: 'PlaceCom Website',
            // CC the user so they have a copy of their message.
            // This also acts as an implicit "reply-to" since replies will go to the recipient.
            cc: email,
        });

        return { status: 'success' };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'Unknown error occurred.';
        console.error('[sendContactEmail] Failed:', message);

        return {
            status: 'error',
            message: `Failed to send your message: ${message}`,
        };
    }
}
