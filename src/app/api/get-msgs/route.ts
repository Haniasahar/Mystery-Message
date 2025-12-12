import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/lib/auth";
import User from "@/models/user.models";
import mongoose from "mongoose";
import { ApiResponse } from "@/helpers/response";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;
  // console.log("Session from auth():", session);
  // console.log("User ID:", user?._id);

  if (!session || !user) {
    return ApiResponse.error("Not authorized", 401);
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const userAgg = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },

      {
        $project: {
          messages: {
            $filter: {
              input: "$messages",
              as: "msg",
              cond: { $ne: ["$$msg", {}] }, // remove empty objects from unwind
            },
          },
        },
      },

    ]);

    if (!userAgg || userAgg.length === 0) {
      return ApiResponse.error("No messages yet !!", 404);
    }

    return ApiResponse.success(
      "Messages fetched successfully",
      { messages: userAgg[0]?.messages || [] },
      200
    );
  } catch (error) {
    console.error("Failed to get messages.", error);
    return ApiResponse.error("Failed to get messages.", 500);
  }
}
