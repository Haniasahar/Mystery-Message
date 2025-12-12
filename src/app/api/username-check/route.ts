import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import { usernameValidation } from "@/schemas/signUpSchema";
import z from "zod";
import { ApiResponse } from "@/helpers/response";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };
    const result = usernameQuerySchema.safeParse(queryParams);
    console.log(result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return ApiResponse.error(
        usernameErrors?.length > 0
          ? usernameErrors.join(", ")
          : "Invalid Username",
        500
      );
    }

    const { username } = result.data;

    const verifiedUser = await User.findOne({ username, isVerified: true });

    if (verifiedUser) {
      return ApiResponse.error("Username already exists", 400);
    }

    return ApiResponse.success("Username is unique");
  } catch (error) {
    console.error("Error checking username", error);
    return ApiResponse.error("Error occured while checking username", 500);
  }
}
