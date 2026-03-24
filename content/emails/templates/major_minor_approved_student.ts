import type { TemplateResult } from '../types'

interface MajorMinorApprovedParams {
    name: string
    pocNote: string
}

export function majorMinorApprovedStudentEmail({ name, pocNote }: MajorMinorApprovedParams): TemplateResult {
    return {
        subject: 'Major/Minor Change Request Approved',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#2baa5e;text-align:center;">Request Approved</h2>
        <div style="height:3px;background-color:#2baa5e;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <p style="font-size:16px;color:#2c3e50;">
          Good news! Your major/minor change request has been <strong>approved</strong> by the leadership team.
        </p>
        
        <div style="background-color:#f9f9f9;padding:15px;border-left:4px solid #2baa5e;margin:20px 0;">
          <p style="font-size:16px;color:#555;margin:0;">
            <strong>Leadership Note:</strong><br>
            ${pocNote || 'No additional remarks.'}
          </p>
        </div>

        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}
