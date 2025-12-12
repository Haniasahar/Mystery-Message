import z from "zod";

export const usernameValidation = z
  .string()
  .min(4, "Username must be at least 4 chars")
  .max(20, "Username must be no more than 20 chars")
  // cannot start with underscore
  .refine((val) => !val.startsWith("_"), {
    message: "Cannot start with _",
  })
  // cannot end with underscore
  .refine((val) => !val.endsWith("_"), {
    message: "Cannot end with _",
  })
  // no double underscores
  .refine((val) => !val.includes("__"), {
    message: "No double __",
  })
  // only letters, numbers, underscore (unicode too)
  .refine((val) => /^[\p{L}\p{N}_]+$/u.test(val), {
    message: "Only letters, numbers and _ allowed",
  })
  // convert to lowercase
  .transform((val) => val.toLowerCase());

const signupPasswordValidation = z
  .string()
  .min(6, "Password must be atleast 6 chars")
  .max(
    15,
    "Long passwords can be forgotten easily. We suggest you to keep it shorter!!"
  )
  .regex(
    /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,15}$/,
    "Password should contain at least 1 special character and 1 number"
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.email({ message: "Please provide a valid email address" }),
  password: signupPasswordValidation,
});
