import dbConnect from "@/lib/dbConnect";
import User, { Message } from "@/models/user.models";
import { ApiResponse } from "@/helpers/response";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();

    const user = await User.findOne({ username });
    if (!user) {
      return ApiResponse.error("User not found", 404);
    }

    if (!user.isAccMsg) {
      return ApiResponse.error("Message acceptance not allowed by user", 403);
    }

    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();

    return ApiResponse.success("Message sent successfully");
  } catch (error) {
    console.error("Failed to send messages.", error);
    return ApiResponse.error("Failed to send messages.", 500);
  }
}
