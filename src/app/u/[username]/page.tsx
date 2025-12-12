"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
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
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { MessageSchema } from "@/schemas/messageSchema";
import { Separator } from "@/components/ui/separator";

export default function Msg_Page() {
  const [suggestions, setSuggestions] = useState("");
  const params = useParams();

  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
    defaultValues: { content: "" },
  });

  const { setValue, watch } = form;
  const messageContent = watch("content");

  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    const loadingToast = toast.loading("Sending your anonymous message...");
    try {
      await axios.post("/api/send-msgs", {
        username: params.username,
        content: data.content.trim(),
      });
      toast.success("Message sent anonymously!", { id: loadingToast });
      form.reset();
    } catch (error) {
      const msg =
        (error as AxiosError<ApiResponse>)?.response?.data?.message ||
        "Failed to send";
      toast.error(msg, { id: loadingToast });
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const id = toast.loading("Loading magic suggestions...");
      try {
        const response = await axios.get("/api/suggest-msgs");
        setSuggestions(response.data);
        toast.success("Ready to send!", { id, duration: 2000 });
      } catch (error) {
        toast.error("No suggestions right now", { id });
      }
    };
    fetchSuggestions();
  }, []);

  const handleSuggestionClick = (text: string) => {
    setValue("content", text.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-linear-to-b from-background to-muted/30">
      <div className="w-full max-w-2xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Send Anonymous Message
          </h1>
          <p className="text-xl text-muted-foreground">
            to{" "}
            <span className="font-bold text-primary">@{params.username}</span>
          </p>
        </div>

        {/* Input Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Write your anonymous message here..."
                      className="text-lg p-7 rounded-2xl border-2 bg-card/80 backdrop-blur 
                                 focus:ring-4 focus:ring-primary/20 focus:border-primary 
                                 transition-all duration-300 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting || !messageContent?.trim()}
              className="w-full text-lg py-7 rounded-2xl font-semibold
                         bg-linear-to-r from-indigo-600 to-purple-600 
                         hover:from-indigo-700 hover:to-purple-700
                         dark:from-indigo-500 dark:to-purple-500
                         shadow-xl hover:shadow-2xl transform hover:scale-[1.02]
                         transition-all duration-300"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-5 w-5" />
                  Send Anonymously
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Suggestions Grid */}
        {suggestions && (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Click any suggestion below to use it
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {suggestions.split("||").map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="group relative p-7 rounded-2xl cursor-pointer
                             bg-linear-to-br from-indigo-50/90 to-purple-50/90
                             dark:from-indigo-900/40 dark:to-purple-900/40
                             border border-indigo-200/70 dark:border-indigo-700/60
                             backdrop-blur-sm
                             hover:shadow-2xl hover:scale-[1.04] hover:border-primary
                             transition-all duration-400"
                >
                  <div
                    className="absolute inset-0 rounded-2xl bg-linear-to-br 
                                  from-primary/10 to-purple-600/10 
                                  dark:from-primary/20 dark:to-purple-500/20
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />

                  <p className="relative text-center text-foreground/90 font-medium text-base leading-relaxed">
                    {suggestion.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-12" />

        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            Want your own anonymous message board?
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="font-bold text-lg px-10 py-6 rounded-xl"
            >
              Create Your Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
