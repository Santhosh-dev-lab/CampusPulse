import nodemailer from "nodemailer";

interface SendOtpOptions {
  email: string;
  code: string;
  recipientName?: string;
}

export interface EmailSendResult {
  success: boolean;
  mode: "SMTP" | "DEV_CONSOLE";
  messageId?: string;
  devCode?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS
    ? process.env.SMTP_PASS.trim().replace(/\s+/g, "")
    : undefined;
  const from =
    process.env.EMAIL_FROM ||
    "\"CampusPulse SRM\" <noreply@campuspulse.srmist.edu.in>";

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      from,
      isConfigured: true,
    };
  }

  return {
    transporter: null,
    from,
    isConfigured: false,
  };
}

export async function sendOtpEmail({
  email,
  code,
  recipientName,
}: SendOtpOptions): Promise<EmailSendResult> {
  const { transporter, from, isConfigured } = getTransporter();
  const name = recipientName || "SRM Student";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your CampusPulse Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #ffffff; margin: 0; padding: 24px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #12161f; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); padding: 36px 32px; }
    .logo { display: inline-block; font-size: 18px; font-weight: 900; color: #ffffff; text-decoration: none; }
    .badge { background: rgba(163, 230, 53, 0.2); color: #A3E635; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; margin-left: 6px; text-transform: uppercase; border: 1px solid rgba(163,230,53,0.3); }
    .title { font-size: 22px; font-weight: 800; margin-top: 24px; margin-bottom: 8px; color: #ffffff; }
    .desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 28px; }
    .code-box { background: #07090e; border: 1px dashed rgba(163, 230, 53, 0.4); border-radius: 14px; padding: 22px; text-align: center; margin-bottom: 24px; }
    .code { font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #A3E635; font-family: monospace; }
    .expire-note { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; }
    .footer { font-size: 11px; color: rgba(255,255,255,0.35); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 28px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <span class="logo">CampusPulse</span>
      <span class="badge">SRM-RMP</span>
    </div>
    
    <div class="title">Verify Your Institutional Access</div>
    <div class="desc">
      Hello ${name},<br>
      Use the following 6-digit one-time code to authenticate your SRM University institutional access on <strong>CampusPulse</strong>.
    </div>

    <div class="code-box">
      <div class="code">${code}</div>
      <div class="expire-note">Expires in 10 minutes • Single-use only</div>
    </div>

    <div class="desc" style="font-size: 12px; margin-bottom: 0;">
      If you did not request this login code, you can safely ignore this email. No access was granted without entering this verification code.
    </div>

    <div class="footer">
      SRM Institute of Science and Technology • Ramapuram Campus<br>
      Directorate of Student Affairs (DSA) • CampusPulse Smart Event Hub
    </div>
  </div>
</body>
</html>
`;

  const textContent = `CampusPulse SRM - Your verification code is ${code}. It expires in 10 minutes.`;

  // 1. Try real SMTP if configured
  if (isConfigured && transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to: email,
        subject: `[CampusPulse] ${code} is your SRM Verification Code`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email Service] Dispatched OTP ${code} to ${email} via SMTP (MessageId: ${info.messageId})`);
      return {
        success: true,
        mode: "SMTP",
        messageId: info.messageId,
      };
    } catch (smtpErr) {
      console.error("[Email Service] SMTP dispatch error, falling back to console:", smtpErr);
    }
  }

  // 2. Development console log
  console.log("\n=======================================================");
  console.log(`📧 [CampusPulse Email Service] VERIFICATION CODE FOR ${email}:`);
  console.log(`                >>>  ${code}  <<<`);
  console.log("             (Valid for 10 minutes)");
  console.log("=======================================================\n");

  return {
    success: true,
    mode: "DEV_CONSOLE",
    devCode: code,
  };
}
