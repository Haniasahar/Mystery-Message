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
      <main className="min-h-screen flex flex-col justify-center py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-5xl mx-auto text-center space-y-8 w-full">
          <div className="space-y-6">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
              Dive into Anonymous Conversations
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Explore Mystery Message — Where your identity stays hidden, and
              your words speak freely.
            </p>
          </div>

          {/* Messages Carousel - Fully Responsive */}
          <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto mt-10 md:mt-14">
            <Carousel
              plugins={[Autoplay({ delay: 4000 })]}
              className="rounded-2xl overflow-hidden shadow-2xl"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {messages.map((message, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0 shadow-xl bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 mx-4 sm:mx-8">
                      <CardHeader className="pb-3 pt-6 sm:pt-8">
                        <div className="flex items-center justify-center gap-3">
                          <MessageSquareQuote className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                          <p className="font-semibold text-lg sm:text-xl text-foreground">
                            {message.title}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 sm:px-10 pt-4 pb-8 text-center">
                        <p className="text-sm sm:text-base md:text-lg italic text-foreground/90 leading-relaxed">
                          "{message.content}"
                        </p>
                      </CardContent>
                      <CardFooter className="justify-center pt-4 text-xs sm:text-sm text-muted-foreground">
                        {message.receivedAt}
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Responsive Arrows - Hidden on very small screens */}
              <CarouselPrevious className="left-2 sm:left-4 -translate-y-1/2 hidden xs:block" />
              <CarouselNext className="right-2 sm:right-4 -translate-y-1/2 hidden xs:block" />
            </Carousel>
          </div>

          {/* CTA */}
          <div className="mt-10 md:mt-14">
            <p className="text-base sm:text-lg text-muted-foreground dark:text-white">
              Ready to receive your first mystery message?
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mystery Message. All rights reserved.
        </p>
      </footer>
    </>
  );
}