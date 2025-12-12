import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.models";
import { ApiResponse } from "@/helpers/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ messageId: string }> }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return ApiResponse.error("Not authorized", 401);
  }

  const { messageId } = await context.params;

  try {
    const dltResult = await User.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (dltResult.modifiedCount == 0) {
      return ApiResponse.error("message not found or already deleted", 404);
    }

    return ApiResponse.success("Message deleted successfully", 200);
  } catch (error) {
    console.error("Failed to delete message", error);
    return ApiResponse.error("Failed to delete message", 500);
  }
}
