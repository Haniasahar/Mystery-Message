import z from "zod";

export const verifySchema = z.object({
  code: z.string().length(6, "Please provide a valid verification code"),
});
