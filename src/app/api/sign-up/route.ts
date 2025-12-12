import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/send_email";
import { ApiResponse } from "@/helpers/response";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // Step 1: Check for verified username
    const verifiedUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (verifiedUserByUsername) {
      return ApiResponse.error("Username is already taken", 400);
    }

    // Step 2: Check for verified email
    const verifiedUserByEmail = await User.findOne({
      email,
      isVerified: true,
    });

    if (verifiedUserByEmail) {
      return ApiResponse.error("This email is already registered", 400);
    }

    // Step 3: At this point → safe to proceed (no verified conflict)
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const lastVerificationEmailSentAt=new Date()

    let user;

    // Find existing unverified user by username OR email (to overwrite if exists)
    const existingUnverifiedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUnverifiedUser) {
      existingUnverifiedUser.password = hashedPassword;
      existingUnverifiedUser.otp = otp;
      existingUnverifiedUser.otpExpiry = otpExpiry;
      existingUnverifiedUser.lastVerificationEmailSentAt = lastVerificationEmailSentAt;

      await existingUnverifiedUser.save();
      user = existingUnverifiedUser;
    } else {
      // Fresh user
      user = new User({
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        lastVerificationEmailSentAt: lastVerificationEmailSentAt,
        isVerified: false,
        isAccMsg: true,
        messages: [],
      });
      await user.save();
    }

    // Step 4: Send verification email
    const emailResponse = await sendVerificationEmail(email, username, otp);

    if (!emailResponse.success) {
      return ApiResponse.error("Failed to send verification email", 500);
    }

    return ApiResponse.success(
      "Sign up successful! Check your email for the verification code",
      {
        redirectTo: `/verify/${username}`,
      }
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    return ApiResponse.error("Something went wrong during sign up", 500);
  }
}
