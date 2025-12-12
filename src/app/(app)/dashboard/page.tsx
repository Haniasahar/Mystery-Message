"use client";

import { accMsgSchema } from "@/schemas/accMsgSchema";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import MsgCard from "@/components/MsgCard";
import { Message } from "@/models/user.models";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { data: session, status } = useSession();

  const form = useForm<z.infer<typeof accMsgSchema>>({
    resolver: zodResolver(accMsgSchema),
    defaultValues: { accMsg: true },
  });

  const acceptMessages = form.watch("accMsg");

  const fetchAcceptStatus = useCallback(async () => {
    setIsSwitching(true);
    try {
      const { data } = await axios.get<ApiResponse>("/api/accept-msgs");
      form.setValue("accMsg", data.isAccMsg ?? true);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Status not found";
      toast.error(msg);
    } finally {
      setIsSwitching(false);
    }
  }, [form]);

  const fetchMessages = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<ApiResponse>("/api/get-msgs");
      setMessages(
        (data.messages || []).map((msg: any) => ({
          ...msg,
          _id: msg._id.toString(),
        }))
      );
      if (refresh) toast.success("Messages refreshed!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "No messages found";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAcceptMessages = async (checked: boolean) => {
    const id = toast.loading("Updating...");
    try {
      await axios.post("/api/accept-msgs", { accMsg: checked });
      form.setValue("accMsg", checked);
      toast.success(checked ? "Now accepting messages" : "Messages paused", {
        id,
      });
    } catch (error) {
      form.setValue("accMsg", !checked);
      toast.error("Update failed", { id });
    }
  };

  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((m) => m._id.toString() !== id));
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || hasLoaded) return;

    fetchAcceptStatus();
    fetchMessages();
    setHasLoaded(true); 
  }, [status, session, hasLoaded, fetchAcceptStatus, fetchMessages]);

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  if (!session?.user)
    return (
      <div className="text-center py-20 text-2xl text-muted-foreground">
        Please sign in
      </div>
    );

  const username = session.user.username || session.user.email?.split("@")[0];
  const profileUrl = `${window.location.origin}/u/${username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied!");
  };

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12 space-y-12">
      <header className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Your Dashboard
        </h1>
      </header>

      {/* Message Settings – subtle accent glow */}
      <Card className="border border-border/60 shadow-xl bg-card/95 backdrop-blur-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-foreground">
            Message Settings
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Control who can send you anonymous messages
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-4">
          <div className="space-y-1">
            <Label
              htmlFor="accept-msgs"
              className="text-base font-medium text-foreground"
            >
              Accepting Messages
            </Label>
            <p className="text-sm text-muted-foreground">
              {isSwitching
                ? "Updating..."
                : acceptMessages
                  ? "Open to messages"
                  : "Paused"}
            </p>
          </div>
          <Switch
            id="accept-msgs"
            checked={acceptMessages}
            onCheckedChange={toggleAcceptMessages}
            disabled={isSwitching}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
          />
        </CardContent>
      </Card>

      <Separator className="border-border/40" />

      {/* Messages Grid – cards with subtle accent on hover */}
      <Card className="border border-border/60 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground">
                Your Messages
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                All anonymous messages sent to you
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages(true)}
              disabled={isLoading}
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/60 hover:text-black transition-all dark:hover:bg-primary/65 "
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-xl text-muted-foreground font-medium">
                No messages yet. Share your link and start receiving!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.map((msg) => (
                <MsgCard
                  key={msg._id.toString()}
                  message={msg}
                  onMsgDlt={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="border-border/40" />

      {/* Share Link – bold accent, premium feel */}
      <Card className="border-2 border-dashed border-primary/40 shadow-2xl bg-card/95 backdrop-blur-sm hover:border-primary/70 hover:shadow-3xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">
            Your Anonymous Link
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Share this anywhere — no login needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-linear-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
            <code className="flex-1 font-mono text-sm md:text-base break-all text-center sm:text-left text-foreground font-medium">
              {profileUrl}
            </code>
            <Button
              onClick={copyLink}
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
