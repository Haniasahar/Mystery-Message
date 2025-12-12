import z from "zod";

const loginPasswordValidation = z
  .string()
  .min(1, "Password is required")
  .max(100, "Password too long");

export const signInSchema = z.object({
  email: z.email({ message: "Please provide a valid email address" }),
  password: loginPasswordValidation,
});
