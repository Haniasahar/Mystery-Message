"use client";

import "animate.css";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (status === "loading" || !mounted) {
    return (
      <nav className="h-16 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </nav>
    );
  }

  const username = session?.user?.username || session?.user?.email || "User";

  return (
    <nav className="h-16 border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href={session ? "/dashboard" : "/"}
          className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 
bg-clip-text text-transparent hover:opacity-80 transition"
        >
          Mystery Message
        </Link>

        {/* Center Welcome Message - Hidden on small screens, visible only on md+ */}
        {session && (
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <span className="text-lg font-bold opacity-80">
              Welcome, <span className="font-semibold">@{username}</span>
            </span>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Optional: Show welcome on mobile in the right side if you want */}
          {session && (
            <span className="md:hidden text-sm font-medium opacity-80">
              @{username}
            </span>
          )}

          {session ? (
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              // className="rounded-md px-4 py-1.5 text-sm transition bg-red-500 text-white hover:bg-red-600"
              className="rounded-md px-4 py-1.5 text-sm transition bg-red-500 text-white hover:bg-red-600 max-[450px]:px-3 max-[450px]:py-1 max-[450px]:text-xs"
              variant="secondary"
            >
              Logout
            </Button>
          ) : (
            <div className="relative flex h-9 items-center overflow-hidden rounded-full bg-muted p-1">
              <span
                className={`absolute inset-0 w-1/2 rounded-full bg-accent transition-transform duration-500 ease-out ${pathname === "/sign-up" ? "translate-x-full" : "translate-x-0"
                  }`}
              />

              <Link
                href="/sign-in"
                className="relative z-10 px-5 text-sm font-medium max-[450px]:px-3 max-[450px]:text-xs"
              >
                <span
                  className={
                    pathname !== "/sign-up"
                      ? "text-white dark:text-accent-foreground"
                      : "text-black"
                  }
                >
                  Sign In
                </span>
              </Link>

              <Link
                href="/sign-up"
                // className="relative z-10 px-5 text-sm font-medium"
                className="relative z-10 px-5 text-sm font-medium max-[450px]:px-3 max-[450px]:text-xs"
              >
                <span
                  className={
                    pathname === "/sign-up"
                      ? "text-white dark:text-accent-foreground"
                      : "text-black"
                  }
                >
                  Sign Up
                </span>
              </Link>
            </div>
          )}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            //   className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border bg-muted hover:bg-muted/80 transition-all"
            className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border bg-muted hover:bg-muted/80 transition-all max-[450px]:w-8 max-[450px]:h-8"
          >
            <Sun
              className={`absolute h-6 w-6 transition-all duration-700 ease-in-out ${theme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"
                }`}
            />
            <Moon
              className={`absolute h-6 w-6 text-black transition-all duration-700 ease-in-out ${theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
                }`}
            />
          </button>
        </div>
      </div>
    </nav>
  );
}