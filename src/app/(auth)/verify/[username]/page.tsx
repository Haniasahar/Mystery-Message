"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import { verifySchema } from "@/schemas/verifySchema";
import Link from "next/link";

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    const toastId = toast.loading("Verifying your account...");

    try {
      await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });

      toast.success("Verified successfully! Welcome to Dashboard", {
        id: toastId,
        duration: 4000,
      });

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const msg =
        axiosError.response?.data.message || "Invalid or expired code";

      toast.error(msg, { id: toastId });
    }
  };

  const handleResend = async () => {
    const toastId = toast.loading("Sending new verification code...");

    try {
      const response = await axios.post("/api/email-send", {
        username: params.username,
      });

      toast.success(
        response.data.message || "New code sent! Check your email",
        {
          id: toastId,
        }
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Failed to resend code. Try again.";
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors">
      <div
        className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg mt-[-56] 
        dark:bg-[oklch(0.21_0.015_240)] dark:text-[oklch(0.97_0.01_240)] dark:mt-[-100] 
        transition-all border"
      >
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight lg:text-5xl 
            bg-linear-to-r from-(--mystery-from) to-(--mystery-to)
            bg-clip-text text-transparent"
          >
            Verify Your Account
          </h1>
          <p className="mt-4 text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
          <p className="mt-2 text-sm font-medium text-accent">
            @{params.username}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      className="text-center text-2xl tracking-widest bg-background border-input 
                        focus:ring-2 focus:ring-accent
                        dark:bg-[oklch(0.24_0.015_240)] dark:border-[oklch(0.27_0.015_240)]
                        dark:focus:ring-accent"
                      maxLength={6}
                      {...field}
                      onChange={(e) => {
                        // Only allow numbers
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(e);
                      }}
                    />
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
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm space-y-3">
          <p className="text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-accent hover:underline focus:outline-none"
            >
              Resend
            </button>
          </p>
          <p>
            <Link href="/sign-in" className="text-accent hover:underline">
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
