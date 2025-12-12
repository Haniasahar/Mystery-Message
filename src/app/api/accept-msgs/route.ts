import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/lib/auth";
import User from "@/models/user.models";
import { ApiResponse } from "@/helpers/response";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return ApiResponse.error("Not authorized", 401);
  }

  const userId = user._id;
  const { accMsg } = await request.json();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAccMsg: accMsg },
      { new: true }
    );

    if (!updatedUser) {
      return ApiResponse.error(
        "Failed to update user status to accept messages.",
        401
      );
    }

    return ApiResponse.success(
      "Message acceptance status updated successfully",
      { isAccMsg: updatedUser.isAccMsg },
      200
    );
  } catch (error) {
    console.error("Failed to update user status to accept messages.", error);
    return ApiResponse.error(
      "Failed to update user status to accept messages.",
      500
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return ApiResponse.error("Not authorized", 401);
  }

  const username = user.username;

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return ApiResponse.error("User not found.", 404);
    }

    return ApiResponse.success(
      "Status fetched successfully",
      { isAccMsg: foundUser.isAccMsg ?? true },
      200
    );
  } catch (error) {
    console.error("Failed to get user status of accepting messages.", error);
    return ApiResponse.error(
      "Failed to get user status of accepting messages.",
      500
    );
  }
}
