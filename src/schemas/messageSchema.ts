import z from "zod";

export const MessageSchema = z.object({
  content: z
    .string()
    .min(8, "Message must be at least 8 chars")
    .max(300, "Message cant be more than 300 chars"),
});
