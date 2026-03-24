import type { TemplateResult } from '../types'

interface RequestPOCEmergencyParams {
    pocName: string
    studentName: string
    studentEmail: string
    studentMessage: string
    portalLink: string
    deadlineStr: string
}

export function requestPOCEmergencyEmail({ pocName, studentName, studentEmail, studentMessage, portalLink, deadlineStr }: RequestPOCEmergencyParams): TemplateResult {
    return {
        subject: `🚨 EMERGENCY Verification Request — ${studentName}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:2px solid #d32f2f;border-radius:5px;">
        <h2 style="color:#d32f2f;text-align:center;">⚠️ EMERGENCY: Verification Request</h2>
        <div style="height:3px;background-color:#d32f2f;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${pocName},</p>
        <div style="background-color:#fff5f5;padding:15px;border-left:4px solid #d32f2f;margin:20px 0;">
          <p style="font-size:16px;color:#d32f2f;margin:0;font-weight:bold;">
            You have received an EMERGENCY verification request from ${studentName} (${studentEmail}).
            You are requested to expedite the processing of this request immediately.
          </p>
        </div>
        <div style="margin:20px 0;padding:15px;border:1px solid #d32f2f;border-radius:5px;">
          <h3 style="color:#2c3e50;margin-top:0;">Student Details</h3>
          <p style="margin:5px 0;font-size:15px;"><strong>Name:</strong> ${studentName}</p>
          <p style="margin:5px 0;font-size:15px;"><strong>Email:</strong> ${studentEmail}</p>
          <p style="margin:5px 0;font-size:15px;"><strong>Message:</strong> ${studentMessage?.trim() || '(none)'}</p>
        </div>
        <p style="font-size:14px;color:#d32f2f;font-weight:bold;">Deadline: <strong>${deadlineStr}</strong>. This is a 24-hour window.</p>
        <div style="text-align:center;margin:25px 0;">
          <a href="${portalLink}" style="background-color:#d32f2f;color:white;padding:12px 25px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block;">
            Open Verification Portal
          </a>
        </div>
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}