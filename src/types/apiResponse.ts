import { Message } from "@/models/user.models";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAccMsg?: boolean;
  messages?: Array<Message>;
}
