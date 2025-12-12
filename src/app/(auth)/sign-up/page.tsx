"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounceCallback } from "usehooks-ts";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // EMAIL CHECK STATES
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const debouncedUsername = useDebounceCallback(setUsername, 500);
  const debouncedEmail = useDebounceCallback(setEmail, 600);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // LIVE USERNAME CHECK
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/username-check?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  // LIVE EMAIL CHECK
  useEffect(() => {
    const checkEmailUnique = async () => {
      if (email && email.includes("@")) {
        setIsCheckingEmail(true);
        setEmailMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/email-check?email=${email}`
          );
          setEmailMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setEmailMessage(
            axiosError.response?.data.message ?? "Error checking email"
          );
        } finally {
          setIsCheckingEmail(false);
        }
      }
    };
    checkEmailUnique();
  }, [email]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    const loadingToast = toast.loading("Creating your account...");

    try {
      await axios.post("/api/sign-up", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created! Taking you to verify...", {
        id: loadingToast,
        duration: 3000,
      });

      setTimeout(() => {
        router.replace(`/verify/${data.username}`);
      }, 800);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const msg = axiosError.response?.data.message || "Sign up failed";

      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background transition-colors">
      <div className="w-full max-w-md p-8 space-y-8 rounded-xl shadow-lg bg-card text-card-foreground  dark:bg-[oklch(0.21_0.015_240)] dark:text-[oklch(0.97_0.01_240)] transition-all">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 bg-linear-to-r from-(--mystery-from) to-(--mystery-to) bg-clip-text text-transparent">
            Join Mystery Message
          </h1>

          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* USERNAME FIELD */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background border-input focus:ring-2 focus:ring-accent
                      dark:bg-[oklch(0.24_0.015_240)] dark:border-[oklch(0.27_0.015_240)]
                      dark:focus:ring-accent"
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debouncedUsername(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && (
                    <p className="text-sm text-blue-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </p>
                  )}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${usernameMessage.includes("unique") ? "text-green-500" : "text-red-500"}`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL FIELD */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background border-input focus:ring-2 focus:ring-accent
                       dark:bg-[oklch(0.24_0.015_240)] dark:border-[oklch(0.27_0.015_240)]
                       dark:focus:ring-accent"
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debouncedEmail(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingEmail && (
                    <p className="text-sm text-blue-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </p>
                  )}
                  {!isCheckingEmail && emailMessage && (
                    <p
                      className={`text-sm ${emailMessage.includes("unique") ? "text-green-500" : "text-red-500"}`}
                    >
                      {emailMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD FIELD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        {...field}
                        className="bg-background border-input focus:ring-2 focus:ring-accent pr-10
             dark:bg-[oklch(0.24_0.015_240)] dark:border-[oklch(0.27_0.015_240)]
             dark:focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-accent text-accent-foreground
              hover:bg-[oklch(0.55_0.18_270)] transition-colors"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
