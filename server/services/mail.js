const nodemailer = require("nodemailer");
const { env } = require("../config/env");

/**
 * Send an OTP email to a user.
 * Standardized for Production with proper Timeouts and Error Handling.
 */
async function sendOtpEmail(toEmail, otp, type = "verification") {
  const subject = type === "FORGOT_PASSWORD" ? "Reset your password" : "Verify your email";
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });

  try {
    await transporter.sendMail({
      from: `"SecureVote" <${env.MAIL_USER}>`,
      to: toEmail,
      subject: `SecureVote: ${subject}`,
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SecureVote OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          <table width="100%" max-width="500px" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px; box-shadow:0 10px 25px rgba(15, 23, 42, 0.08); font-family:Arial, sans-serif; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:32px 24px; background:#0f172a; color:#ffffff;">
                <h1 style="margin:0; font-size:24px; letter-spacing:1px; text-transform:uppercase;">SecureVote</h1>
                <p style="margin:8px 0 0; font-size:12px; opacity:0.7; font-weight:bold; letter-spacing:2px;">ONLINE VOTING PORTAL</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px; color:#334155;">
                <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Identity Verification Code</h2>
                <p style="font-size:15px; line-height:1.6; color:#64748b;">
                  Hello, thank you for using <strong>SecureVote</strong>.  
                  To complete your ${type === 'FORGOT_PASSWORD' ? 'password reset' : 'registration'}, please use the One-Time Password (OTP) below.
                </p>

                <!-- OTP Box -->
                <div style="
                  margin:32px 0;
                  padding:20px;
                  background:#f8fafc;
                  border:2px dashed #e2e8f0;
                  border-radius:8px;
                  text-align:center;
                  font-size:36px;
                  font-weight:bold;
                  letter-spacing:10px;
                  color:#0f172a;">
                  ${otp}
                </div>

                <p style="font-size:14px; line-height:1.6; color:#64748b;">
                  This OTP is valid for <strong>10 minutes</strong>.  
                  <strong>SecureVote officers will never ask for this code.</strong> Never share it with anyone.
                </p>

                <div style="margin-top:32px; padding:16px; background:#fff7ed; border-radius:8px; border-left:4px solid #f97316;">
                  <p style="margin:0; font-size:12px; color:#9a3412; font-weight:bold;">
                    SECURITY ALERT: If you did not request this code, your account might be under unauthorized access attempt. Please secure your account immediately.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:24px; background:#f8fafc; border-top:1px solid #f1f5f9;">
                <p style="margin:0; font-size:11px; color:#94a3b8; line-height:1.5;">
                  © ${new Date().getFullYear()} SecureVote Digital Infrastructure.<br/>
                  This is an automated security message.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    });
    console.log("✅ OTP email sent successfully to:", toEmail);
    return true;
  } catch (error) {
    console.error("❌ OTP Email service failed:", error.message);
    throw new Error("Email service failed: " + error.message);
  }
}

module.exports = { sendOtpEmail };
