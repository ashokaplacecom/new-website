import type { TemplateResult } from '../types'

interface RequestPOCParams {
    pocName: string
    studentName: string
    studentEmail: string
    studentMessage: string
    portalLink: string
    deadlineStr: string
}

export function requestPOCEmail({ pocName, studentName, studentEmail, studentMessage, portalLink, deadlineStr }: RequestPOCParams): TemplateResult {
    return {
        subject: `New Verification Request — ${studentName}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
        <h2 style="color:#2c3e50;text-align:center;">Superset Verification System</h2>
        <div style="height:3px;background-color:#3498db;margin-bottom:20px;"></div>
        <p style="font-size:16px;color:#2c3e50;">Hello ${pocName},</p>
        <div style="background-color:#f9f9f9;padding:15px;border-left:4px solid #3498db;margin:20px 0;">
          <p style="font-size:16px;color:#2c3e50;margin:0;">
            You have a new verification request from <strong>${studentName}</strong> (${studentEmail}).
            Please review it at your earliest convenience.
          </p>
        </div>
        <div style="margin:20px 0;padding:15px;border:1px solid #e1e1e1;border-radius:5px;">
          <h3 style="color:#2c3e50;margin-top:0;">Student Details</h3>
          <p style="margin:5px 0;font-size:15px;"><strong>Name:</strong> ${studentName}</p>
          <p style="margin:5px 0;font-size:15px;"><strong>Email:</strong> ${studentEmail}</p>
          <p style="margin:5px 0;font-size:15px;"><strong>Message:</strong> ${studentMessage?.trim() || '(none)'}</p>
        </div>
        <p style="font-size:14px;color:#d32f2f;">Please verify by <strong>${deadlineStr}</strong>.</p>
        <div style="text-align:center;margin:25px 0;">
          <a href="${portalLink}" style="background-color:#3498db;color:white;padding:12px 25px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block;">
            Open Verification Portal
          </a>
        </div>
        <p style="font-size:14px;color:#7f8c8d;margin-top:30px;">Best regards,<br>PlaceCom</p>
      </div>
    `,
    }
}