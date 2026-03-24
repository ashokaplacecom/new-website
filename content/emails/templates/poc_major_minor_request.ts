import type { TemplateResult } from '../types'

interface POCMajorMinorRequestParams {
    pocName: string
    studentName: string
    studentEmail: string
    currentMajor?: string | null
    currentMinor?: string | null
    prospectiveMajor?: string | null
    prospectiveMinor?: string | null
    portalLink: string
}

export function pocMajorMinorRequestEmail({ 
    pocName, 
    studentName, 
    studentEmail,
    currentMajor,
    currentMinor,
    prospectiveMajor,
    prospectiveMinor,
    portalLink 
}: POCMajorMinorRequestParams): TemplateResult {
    return {
        subject: 'New Major/Minor Change Request',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#2c3e50;text-align:center;">Action Required: Major/Minor Change</h2>
        <div style="height:3px;background-color:#e67e22;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${pocName},</p>
        <p style="font-size:16px;color:#2c3e50;">A new major/minor change request has been raised by <strong>${studentName}</strong> (${studentEmail}).</p>
        
        <div style="background-color:#fef5e7;padding:15px;border-left:4px solid #e67e22;margin:20px 0;">
          <h3 style="margin-top:0;color:#d35400;">Request Details</h3>
          <ul style="color:#555;font-size:14px;list-style-type:none;padding:0;margin:0;">
            <li style="margin-bottom:8px;"><strong>Current Major:</strong> ${currentMajor || 'N/A'}</li>
            <li style="margin-bottom:8px;"><strong>Current Minor:</strong> ${currentMinor || 'N/A'}</li>
            <li style="margin-bottom:8px;"><strong>Prospective Major:</strong> ${prospectiveMajor || 'N/A'}</li>
            <li><strong>Prospective Minor:</strong> ${prospectiveMinor || 'N/A'}</li>
          </ul>
        </div>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="${portalLink}" style="background-color:#3498db;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:3px;font-weight:bold;display:inline-block;">Review Request in Portal</a>
        </div>
        
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom Automated System</p>
      </div>
    `,
    }
}
