import type { TemplateResult } from '../types'

interface RequestStudentParams {
    name: string
    currentMajor?: string | null
    currentMinor?: string | null
    prospectiveMajor?: string | null
    prospectiveMinor?: string | null
}

export function studentMajorMinorRequestEmail({ name, currentMajor, currentMinor, prospectiveMajor, prospectiveMinor }: RequestStudentParams): TemplateResult {
    return {
        subject: 'Major/Minor Change Request Submitted',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#2c3e50;text-align:center;">Major/Minor Change System</h2>
        <div style="height:3px;background-color:#3498db;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <div style="background-color:#f9f9f9;padding:15px;border-left:4px solid #3498db;margin:20px 0;">
          <p style="font-size:16px;color:#2c3e50;margin:0;">
            Your major/minor change request has been submitted successfully to the leadership team. You will be notified once it has been reviewed.
          </p>
        </div>
        <ul style="color:#555;font-size:14px;list-style-type:none;padding:0;">
          <li><strong>Current Major:</strong> ${currentMajor || 'N/A'}</li>
          <li><strong>Current Minor:</strong> ${currentMinor || 'N/A'}</li>
          <li><strong>Prospective Major:</strong> ${prospectiveMajor || 'N/A'}</li>
          <li><strong>Prospective Minor:</strong> ${prospectiveMinor || 'N/A'}</li>
        </ul>
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}
