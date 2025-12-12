import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import { sendVerificationEmail } from "@/helpers/send_email";
import { ApiResponse } from "@/helpers/response";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username } = await request.json();

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return ApiResponse.error("User not found", 400);
    }

    if (user.isVerified) {
      return ApiResponse.error("User already verified", 400);
    }

    const now = new Date();

    // Rate limit: only allow sending once per hour
    if (user.lastVerificationEmailSentAt) {
      const timeSinceLastEmail =
        now.getTime() - new Date(user.lastVerificationEmailSentAt).getTime();

      if (timeSinceLastEmail < 1000 * 60 * 60) {
        const minutesLeft = Math.ceil(
          (1000 * 60 * 60 - timeSinceLastEmail) / 60000
        );
        return ApiResponse.error(
          `Verification email already sent recently. Try again in ${minutesLeft} minutes.`,
          429
        );
      }
    }

    if (user.otpExpiry && user.otpExpiry > now) {
      return ApiResponse.error(
        "An existing verification code is still valid. Check your email.",
        429
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastVerificationEmailSentAt = new Date();
    await user.save();

    const emailResponse = await sendVerificationEmail(
      user.email,
      username,
      otp
    );

    if (!emailResponse.success) {
      return ApiResponse.error("Failed to send verification email", 500);
    }

    return ApiResponse.success(
      "Verification email sent successfully! Check your email for the verification code",
      {
        redirectTo: `/verify/${username}`,
      }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return ApiResponse.error(
      "Something went wrong sending verification email",
      500
    );
  }
}
