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
      <h2>Password Reset</h2>
      <p>Your OTP code is: <strong>${code}</strong></p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};
