import { BaseEmailTemplate, EmailParams } from '../types';

export interface FeedbackInboundData {
    fullName: string;
    email: string;
    issueType: string;
    description: string;
    attachmentUrl: string | null;
    submittedAt: string;
}

export function feedbackInboundEmail(data: FeedbackInboundData): BaseEmailTemplate {
    const { fullName, email, issueType, description, attachmentUrl, submittedAt } = data;

    const attachmentHtml = attachmentUrl 
        ? `<div style="margin-top: 20px;"><a href="${attachmentUrl}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Attachment / Screenshot</a></div>` 
        : '';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
            <h2 style="color: #000000; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">New Feedback Received</h2>
            
            <div style="margin: 20px 0; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${fullName || 'Anonymous'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email || 'Not provided'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Issue Type:</strong> <span style="background-color: #e2e8f0; padding: 2px 8px; border-radius: 12px; font-size: 14px;">${issueType}</span></p>
                <p style="margin: 0 0 10px 0;"><strong>Submitted at:</strong> ${submittedAt}</p>
            </div>

            <div style="margin: 20px 0;">
                <h3 style="color: #666666; margin-bottom: 10px; font-size: 16px;">Description:</h3>
                <div style="background-color: #ffffff; border: 1px solid #eeeeee; padding: 20px; border-radius: 8px; white-space: pre-wrap;">${description}</div>
            </div>

            ${attachmentHtml}
        </div>
    `;

    return {
        subject: `[Feedback] ${issueType} - from ${fullName || 'Anonymous'}`,
        html,
    };
}
