import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";
import VerifyIdentityEmail from "../../emails/plaid-verify-identity";

export async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Mystry Msg <onboarding@resend.dev>",
      to: email,
      subject: "Mystery Message | Verification Code",
      react: VerifyIdentityEmail({ username, otp }),
    });
    return {
      success: true,
      message: "Verification Email sent successfully",
    };
  } catch (email_error) {
    console.error("Error sending Verification Email", email_error);
    return { success: false, message: "Error sending Verification Email" };
  }
}
