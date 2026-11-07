"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import QueryProvider from "./query.provider";
import { ChatSocketProvider } from "./chat-socket.provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <QueryProvider>
        <ChatSocketProvider>
          <TooltipProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ChatSocketProvider>
      </QueryProvider>
    </MotionConfig>
  );
}
