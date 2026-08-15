import type { TemplateResult } from '../types';

interface RecruiterInboundParams {
    fullName: string;
    email: string;
    company: string;
    opportunityType: string;
    subject?: string;
    message: string;
    attachmentUrl?: string | null;
    submittedAt?: string;
}

export function recruiterInboundEmail(params: RecruiterInboundParams): TemplateResult {
    const timestamp = params.submittedAt ?? new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'long',
        timeStyle: 'short',
    });

    // Escape HTML entities in user-provided content
    const escape = (str: string) =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');

    return {
        subject: `[PlaceCom Recruiter] ${params.subject || 'Inquiry from ' + params.company}`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8f9fa; padding: 32px 20px;">
            
            <!-- Card -->
            <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2e1a1a 0%, #3e1616 50%, #600f0f 100%); padding: 32px 36px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #cca0a0; text-transform: uppercase;">PlaceCom Partnerships</p>
                    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #ffffff;">New Recruiter Inquiry</h1>
                    <p style="margin: 0; font-size: 13px; color: #be7f7f;">${timestamp}</p>
                </div>

                <!-- Body -->
                <div style="padding: 32px 36px;">

                    <!-- Intro -->
                    <p style="margin: 0 0 24px; font-size: 15px; color: #444; line-height: 1.6;">
                        You have received a new inquiry from an external recruiter via the <strong>Recruiter Contact</strong> page. Details are below.
                    </p>

                    <!-- Sender Info -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 10px 14px; background: #f1f5f9; border-radius: 6px 6px 0 0; border-bottom: 1px solid #e2e8f0; width: 50%;">
                                <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;">Name</p>
                                <p style="margin: 2px 0 0; font-size: 15px; font-weight: 600; color: #1e293b;">${escape(params.fullName)}</p>
                            </td>
                            <td style="padding: 10px 14px; background: #f1f5f9; border-radius: 6px 6px 0 0; border-bottom: 1px solid #e2e8f0; width: 50%;">
                                <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;">Company</p>
                                <p style="margin: 2px 0 0; font-size: 15px; font-weight: 600; color: #1e293b;">${escape(params.company)}</p>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px 14px; background: #f8fafc; border-radius: 0 0 6px 6px;">
                                <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;">Email</p>
                                <a href="mailto:${escape(params.email)}" style="display: inline-block; margin: 2px 0 0; font-size: 15px; font-weight: 500; color: #2563eb; text-decoration: none;">${escape(params.email)}</a>
                            </td>
                        </tr>
                    </table>

                    <!-- Subject -->
                    ${params.subject ? `
                    <div style="margin-bottom: 20px; padding: 12px 16px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px;">
                        <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #3b82f6; text-transform: uppercase;">Subject</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">${escape(params.subject)}</p>
                    </div>
                    ` : ''}

                    <!-- Opp Type -->
                    <div style="margin-bottom: 20px; padding: 12px 16px; background: #fdf2f8; border-left: 3px solid #db2777; border-radius: 4px;">
                        <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #db2777; text-transform: uppercase;">Opportunity Type</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">${escape(params.opportunityType)}</p>
                    </div>

                    <!-- Message -->
                    <div style="margin-bottom: 28px;">
                        <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;">Message & Details</p>
                        <div style="padding: 18px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; line-height: 1.7; color: #374151; word-wrap: break-word;">
                            <!-- We don't escape the message because it comes from a rich text editor. We assume it's sanitized by the editor (react-quill) -->
                            ${params.message}
                        </div>
                    </div>

                    <!-- Attachment -->
                    ${params.attachmentUrl ? `
                    <div style="margin-bottom: 28px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
                        <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #166534;">An attachment was provided with this inquiry.</p>
                        <a href="${params.attachmentUrl}" target="_blank" style="display: inline-block; padding: 10px 24px; background: #22c55e; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                            View Attachment
                        </a>
                    </div>
                    ` : ''}

                    <!-- Reply CTA -->
                    <div style="text-align: center; margin-top: 8px;">
                        <a href="mailto:${escape(params.email)}?subject=Re: Inquiry with Ashoka PlaceCom"
                           style="display: inline-block; padding: 12px 32px; background: #1e293b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                            Reply to ${escape(params.fullName)}
                        </a>
                    </div>

                </div>

                <!-- Footer -->
                <div style="padding: 20px 36px; background: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                        This message was sent via the PlaceCom website Recruiter page.<br>
                        To respond, reply directly to this email or use the button above.
                    </p>
                </div>

            </div>
        </div>
        `,
    };
}
