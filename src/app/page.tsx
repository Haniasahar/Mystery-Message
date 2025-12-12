"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";
import { MessageSquareQuote } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <main className="grow flex flex-col items-center justify-center py-12 md:py-14 lg:py-14 bg-linear-to-b from-background to-muted/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-linear-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Dive into Anonymous Conversations
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore Mystery Message — Where your identity stays hidden, and
              your words speak freely.
            </p>
          </div>

          {/* Messages Carousel */}
          <div className="w-full max-w-2xl mx-auto mt-12">
            <Carousel
              plugins={[Autoplay({ delay: 3000 })]}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <CarouselContent>
                {messages.map((message, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0 shadow-xl bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <MessageSquareQuote className="w-6 h-6 text-primary" />
                          <p className="font-semibold text-lg text-foreground">
                            {message.title}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-8 pt-6 pb-8 text-center">
                        <p className="text-base md:text-lg italic text-foreground/90 leading-relaxed max-w-xl mx-auto">
                          "{message.content}"
                        </p>
                      </CardContent>
                      <CardFooter className="pt-4 text-sm text-muted-foreground">
                        {message.receivedAt}
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <p className="text-muted-foreground dark:text-white">
              Ready to receive your first mystery message?
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mystery Message. All rights
          reserved.
        </p>
      </footer>
    </>
  );
}
