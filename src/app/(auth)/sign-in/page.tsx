"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
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
import { signInSchema } from "@/schemas/signInSchema";
import z from "zod";
import axios from "axios";
import { useState } from "react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { data: session, update } = useSession();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const loadingToast = toast.loading("Signing in...");

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email.toLowerCase().trim(),
      password: data.password,
    });

    if (result?.error) {
      let userMessage = "Something went wrong. Please try again.";

      switch (result.error) {
        case "USER_NOT_FOUND":
          userMessage = "No account found with this email.";
          break;
        case "WRONG_PASSWORD":
          userMessage = "Incorrect password. Try again.";
          break;
        default:
          userMessage = "Invalid credentials. Please check and try again.";
      }

      toast.error(userMessage, { id: loadingToast });
      return;
    }

    await update();

    const freshSession = await fetch("/api/auth/session").then((res) =>
      res.json()
    );
    const username = freshSession?.user?.username;

    if (freshSession?.user?.isVerified) {
      toast.success(`Welcome back ${username}! Directing to Dashboard...`, {
        id: loadingToast,
      });
      setTimeout(() => router.replace("/dashboard"), 800);
    } else {
      toast.success("Please verify your account first, sending new OTP...", {
        id: loadingToast,
      });

      try {
        const response = await axios.post("/api/email-send", {
          username: username,
        });

        toast.success(
          response.data.message || "New code sent! Check your email",
          {
            id: loadingToast,
          }
        );
        setTimeout(() => router.replace(`/verify/${username}`), 1000);
      } catch (error: any) {
        const errorData = error.response?.data;
        if (errorData?.statusCode === 429) {
          toast.error(errorData.message, { id: loadingToast });

          setTimeout(() => router.replace(`/verify/${username}`), 2000);
          return;
        } else {
          const msg =
            errorData?.message ||
            "Failed to send verification code. Try again.";
          toast.error(msg, { id: loadingToast });
        }
        router.replace(`/verify/${username}`);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background transition-colors">
      <div
        className="w-full max-w-md p-6 space-y-6 rounded-xl shadow-lg 
        bg-card text-card-foreground mb-[84px]
        dark:bg-[oklch(0.21_0.015_240)] dark:text-[oklch(0.97_0.01_240)] 
        transition-all border"
      >
        <div className="text-center">
          <h1
            className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 
             bg-linear-to-r from-(--mystery-from) to-(--mystery-to) 
             bg-clip-text text-transparent"
          >
            Welcome Back
          </h1>
          <p className="mb-4">Sign in to continue your anonymous adventure</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* EMAIL FIELD */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      className="bg-background border-input focus:ring-2 focus:ring-accent
                       dark:bg-[oklch(0.24_0.015_240)] dark:border-[oklch(0.27_0.015_240)]
                       dark:focus:ring-accent"
                    />
                  </FormControl>
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
              className="w-full bg-accent
               text-accent-foreground
             hover:bg-[oklch(0.55_0.18_270)] transition-colors"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-[-72] dark:hover:bg-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 hover:text-black"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66v-2.77h-3.57c-1.04.67-2.3 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.38-.99-.6-2.04-.6-3.09 0-1.05.22-2.1.6-3.09V5.07H2.18C1.43 6.91 1 8.93 1 11s.43 4.09 1.18 5.91l3.66-2.82z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          Sign in with Google
        </Button>

        <div className="text-center">
          <p>
            New to Mystery Message?{" "}
            <Link
              href="/sign-up"
              className="text-accent hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
