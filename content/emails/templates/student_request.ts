import type { TemplateResult } from '../types'

interface RequestStudentParams {
    name: string
    message: string  // the student's own message back to them for confirmation
}

export function requestStudentEmail({ name, message }: RequestStudentParams): TemplateResult {
    return {
        subject: 'Verification Request Submitted',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#2c3e50;text-align:center;">Superset Verification System</h2>
        <div style="height:3px;background-color:#3498db;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <div style="background-color:#f9f9f9;padding:15px;border-left:4px solid #3498db;margin:20px 0;">
          <p style="font-size:16px;color:#2c3e50;margin:0;">
            Your verification request has been submitted successfully. Your Point of Contact (POC) will review it within <strong>48 hours</strong>.
          </p>
        </div>
        <p style="font-size:14px;color:#555;"><strong>Your message to POC:</strong> ${message?.trim() || '(none)'}</p>
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}