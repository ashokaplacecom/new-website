import type { TemplateResult } from '../types'

interface MajorMinorRejectedParams {
    name: string
    pocNote: string
}

export function majorMinorRejectedStudentEmail({ name, pocNote }: MajorMinorRejectedParams): TemplateResult {
    return {
        subject: 'Major/Minor Change Request Denied',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#d32f2f;text-align:center;">Request Denied</h2>
        <div style="height:3px;background-color:#d32f2f;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <p style="font-size:16px;color:#2c3e50;">
          Your major/minor change request has been <strong>rejected</strong> by the leadership team.
        </p>
        
        <div style="background-color:#f9eaeb;padding:15px;border-left:4px solid #d32f2f;margin:20px 0;">
          <p style="font-size:16px;color:#555;margin:0;">
            <strong>Leadership Note:</strong><br>
            ${pocNote || 'No additional remarks provided.'}
          </p>
        </div>

        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}
