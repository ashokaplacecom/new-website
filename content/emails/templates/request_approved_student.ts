import type { TemplateResult } from '../types'

interface ApprovedStudentParams {
    name: string
    pocNote: string
}

export function requestApprovedStudentEmail({ name, pocNote }: ApprovedStudentParams): TemplateResult {
    return {
        subject: 'Verification Request Approved',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#065f46;text-align:center;">Superset Verification System</h2>
        <div style="height:3px;background-color:#10b981;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <div style="background-color:#f0fdf4;padding:15px;border-left:4px solid #10b981;margin:20px 0;">
          <p style="font-size:16px;color:#065f46;margin:0;font-weight:bold;">
            ✅ Your verification request has been approved.
          </p>
        </div>
        ${pocNote?.trim() ? `<p style="font-size:14px;color:#555;"><strong>Note from your verifier:</strong> ${pocNote}</p>` : ''}
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}