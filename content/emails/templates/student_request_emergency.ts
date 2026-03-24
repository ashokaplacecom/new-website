import type { TemplateResult } from '../types'

interface RequestStudentEmergencyParams {
    name: string
    message: string
    emergenciesRemaining: number
}

export function requestStudentEmergencyEmail({ name, message, emergenciesRemaining }: RequestStudentEmergencyParams): TemplateResult {
    return {
        subject: 'Emergency Verification Request Submitted',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#d32f2f;text-align:center;">Superset Verification System</h2>
        <div style="height:3px;background-color:#d32f2f;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${name},</p>
        <div style="background-color:#fff5f5;padding:15px;border-left:4px solid #d32f2f;margin:20px 0;">
          <p style="font-size:16px;color:#2c3e50;margin:0;">
            Your <strong>emergency</strong> verification request has been submitted. Your POC has been notified and is expected to respond within <strong>24 hours</strong>.
          </p>
        </div>
        <p style="font-size:14px;color:#555;"><strong>Your message to POC:</strong> ${message?.trim() || '(none)'}</p>
        <p style="font-size:14px;color:#d32f2f;">
          You have <strong>${emergenciesRemaining}</strong> emergency request(s) remaining this semester.
        </p>
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}