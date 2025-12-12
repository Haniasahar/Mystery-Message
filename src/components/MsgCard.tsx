"use client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Message } from "@/models/user.models";
import { Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";

type MsgCardProps = {
  message: Message;
  onMsgDlt: (id: string) => void;
};

export default function MsgCard({ message, onMsgDlt }: MsgCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const id = toast.loading("Deleting...");
    try {
      await axios.delete(`/api/delete-msgs/${message._id}`);
      onMsgDlt(message._id.toString());
      toast.success("Message deleted", { id });
    } catch (error) {
      toast.error("Failed to delete", { id });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border bg-card/90 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {message.content}
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleting}
                className="text-red-600 hover:bg-red-400 dark:hover:bg-red-950 dark:hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-gray-500 hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white dark:hover:bg-amber-950 dark:hover:text-red-300 "
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground pt-4 border-t">
        {new Date(message.createdAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </CardFooter>
    </Card>
  );
}
