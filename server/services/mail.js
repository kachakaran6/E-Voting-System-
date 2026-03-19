const nodemailer = require("nodemailer");
const { env } = require("../config/env");

let transporter = null;

if (env.MAIL_SERVICE || (env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS)) {
  const config = env.MAIL_SERVICE 
    ? { service: env.MAIL_SERVICE, auth: { user: env.MAIL_USER, pass: env.MAIL_PASS } }
    : {
        host: env.MAIL_HOST,
        port: env.MAIL_PORT,
        secure: env.MAIL_PORT === 465,
        auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
        family: 4,
        tls: { rejectUnauthorized: false }
      };
      
  transporter = nodemailer.createTransport(config);
}

/**
 * Send an OTP email to a user.
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} type 
 */
async function sendOtpEmail(toEmail, otp, type = "verification") {
  const subject = type === "FORGOT_PASSWORD" ? "Reset your password" : "Verify your email";
  
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${env.MAIL_FROM.split('@')[0]}" <${env.MAIL_FROM}>`,
        to: toEmail,
        subject: `E-Voting: ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0f172a; text-align: center;">E-Voting Portal</h2>
            <p>Hello,</p>
            <p>You requested a code for <strong>${subject.toLowerCase()}</strong>. Please use the following 6-digit OTP:</p>
            <div style="margin: 30px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; background: #f8fafc; padding: 10px 20px; border-radius: 5px; border: 1px solid #e2e8f0;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 13px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} E-Voting System. Secure & Transparent.</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error("Error sending real email, falling back to console:", error.message);
    }
  }

  // Fallback to console logging
  console.log("------------------------------------------");
  console.log(`[SIMULATED MAIL] To: ${toEmail}`);
  console.log(`[SIMULATED MAIL] Subject: ${subject}`);
  console.log(`[SIMULATED MAIL] Content: Your OTP code is [ ${otp} ]`);
  console.log("------------------------------------------");
  
  return true;
}

module.exports = { sendOtpEmail };
