import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import { ApiResponse } from "@/helpers/response";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    // const decodedUsername = decodeURIComponent(username);
    const user = await User.findOne({ username: username });
    if (!user) {
      return ApiResponse.error("User not found", 400);
    }

    const isUserValid = user.otp === code;
    if (!isUserValid) {
      return ApiResponse.error("Incorrect verification code", 400);
    }

    const isOtpNotExp = new Date(user.otpExpiry) > new Date();
    if (!isOtpNotExp) {
      return ApiResponse.error(
        "OTP has expired. Please again sign up to get new OTP",
        400
      );
    }

    user.isVerified = true;
    await user.save();
    return ApiResponse.success("User verified successfully");
  } catch (error) {
    console.error("Error verifying user", error);
    return ApiResponse.error("Error verifying user", 500);
  }
}
