import type { TemplateResult } from '../types'

interface RejectedStudentParams {
    name: string
    pocNote: string
}

export function requestRejectedStudentEmail({ name, pocNote }: RejectedStudentParams): TemplateResult {
    return {
        subject: 'Verification Request Rejected',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#7f1d1d;text-align:center;">Superset Verification System</h2>
        <div style="height:3px;background-color:#ef4444;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <div style="background-color:#fef2f2;padding:15px;border-left:4px solid #ef4444;margin:20px 0;">
          <p style="font-size:16px;color:#7f1d1d;margin:0;">
            ❌ Your verification request has been rejected. Please log in to your Superset account and head to your profile page for further details.
          </p>
        </div>
        ${pocNote?.trim() ? `<p style="font-size:14px;color:#555;"><strong>Note from your verifier:</strong> ${pocNote}</p>` : ''}
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}