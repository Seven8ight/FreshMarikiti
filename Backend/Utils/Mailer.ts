import { Resend } from "resend";
import { RESEND_API_KEY } from "../Config/Env.js";

const resend = new Resend(RESEND_API_KEY);

export const sendOtpEmail = async (to: string, code: string): Promise<void> => {
  await resend.emails.send({
    from: "FreshMarikiti <no-reply@ferracorp.com>",
    to,
    subject: "Your Password Reset Code",
    text: `Your OTP code is: ${code}. It expires in 10 minutes.`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background:#16a34a;padding:30px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;">
                FreshMarikiti
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;color:#374151;">
              <h2 style="margin-top:0;color:#111827;">
                Password Reset Request
              </h2>

              <p style="font-size:16px;line-height:1.6;">
                We received a request to reset your password.
                Use the verification code below to continue:
              </p>

              <!-- OTP Box -->
              <div style="text-align:center;margin:30px 0;">
                <div style="
                  display:inline-block;
                  background:#f3f4f6;
                  border:2px dashed #16a34a;
                  border-radius:10px;
                  padding:18px 32px;
                  font-size:32px;
                  font-weight:bold;
                  letter-spacing:8px;
                  color:#16a34a;
                ">
                  ${code}
                </div>
              </div>

              <p style="font-size:16px;line-height:1.6;">
                This code will expire in <strong>10 minutes</strong>.
              </p>

              <p style="font-size:16px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

              <p style="font-size:13px;color:#6b7280;line-height:1.5;">
                For security reasons, never share this code with anyone.
                FreshMarikiti staff will never ask for your verification code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f9fafb;padding:20px;color:#6b7280;font-size:12px;">
              © ${new Date().getFullYear()} FreshMarikiti. All rights reserved.
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
};
