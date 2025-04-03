import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    console.log("Email request received for", email, "with OTP:", otp);

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px; background-color: #fffcf6;">
          <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #3c6ca8; font-size: 24px; margin-bottom: 10px;">OTP Verification</h1>
              <div style="height: 3px; background-color: #3c6ca8; width: 100px; margin: 0 auto;"></div>
          </div>
          
          <p style="color: #444; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for registering with our service. To complete your verification, please use the following One-Time Password (OTP):
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #3c6ca8;">${otp}</span>
          </div>
          
          <p style="color: #444; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you did not request this OTP, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #888; font-size: 14px; text-align: center;">
              <p>This is an automated message. Please do not reply to this email.</p>
          </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Aizy <onboarding@resend.dev>",
      to: email,
      subject: "Your Verification Code",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Email sent successfully with ID:", data.id);
    return NextResponse.json({
      success: true,
      messageId: data.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Email sending failed" },
      { status: 500 }
    );
  }
}
