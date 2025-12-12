import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import z from "zod";
import { ApiResponse } from "@/helpers/response";

const emailQuerySchema = z.object({
  email: z.email({ message: "Please provide a valid email address" }),
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      email: searchParams.get("email"),
    };
    const result = emailQuerySchema.safeParse(queryParams);
    console.log(result);

    if (!result.success) {
      const emailErrors = result.error.format().email?._errors || [];
      return ApiResponse.error(
        emailErrors?.length > 0
          ? emailErrors.join(", ")
          : "Invalid Email",
        500
      );
    }

    const { email } = result.data;

    const verifiedUser = await User.findOne({ email, isVerified: true });

    if (verifiedUser) {
      return ApiResponse.error("Email already exists", 400);
    }

    return ApiResponse.success("Email is unique");
  } catch (error) {
    console.error("Error checking email", error);
    return ApiResponse.error("Error occured while checking email", 500);
  }
}

//   if (!email) {
//     return ApiResponse.error("Email is required", 400);
//   }
