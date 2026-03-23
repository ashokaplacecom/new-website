import type { TemplateResult } from '../types';

interface OtpEmailParams {
    name: string;
    otp: string;
}

export function otpEmail(params: OtpEmailParams): TemplateResult {
    return {
        subject: "Superset Verification: Your OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin-bottom: 5px;">Superset Verification System</h2>
                <div style="height: 3px; background-color: #3498db; margin: 0 auto;"></div>
            </div>
            <p style="font-size: 16px; color: #2c3e50;">Hello ${params.name || "there"},</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                <p style="font-size: 16px; color: #2c3e50; margin: 0;">Here is your one-time verification code:</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #e8f0fe; display: inline-block; padding: 15px 40px; border-radius: 4px; letter-spacing: 10px; font-size: 32px; font-weight: bold; color: #1a73e8;">${params.otp}</div>
                <p style="margin-top: 15px; color: #7f8c8d; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #e1e1e1; border-radius: 5px; background-color: #fafafa;">
                <p style="margin: 0; color: #555; font-size: 14px;">If you didn\'t request this code, please ignore this email.</p>
            </div>
            <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">Best regards,<br>PlaceCom</p>
        </div>
        `
    };
}