// File: src/app/(app)/layout.tsx

import { Navbar } from "../../components/Navbar";
import "./globals.css";
import { PHProvider } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import meta from "next-gen/config";
import PlausibleProvider from "next-plausible";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ChatbotWidget from "@/components/ChatbotWidget";

const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: meta["og:title"],
  description: meta["og:description"],
  category: "technology",
  openGraph: {
    type: "website",
    title: meta["og:title"],
    description: meta["og:description"],
    locale: "en_US",
    images: "/og.jpg",
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full h-full">
      <ClerkProvider>
        <TooltipProvider>
          {process.env.PLAUSIBLE_DOMAIN && (
            <head>
              <PlausibleProvider domain={process.env.PLAUSIBLE_DOMAIN} />
            </head>
          )}
          <PHProvider>
            <body className={`${inter.className} w-full h-full`}>
              <PostHogPageView />
              <div className="w-full h-full flex flex-col">
                <div className="z-[-1] fixed inset-0 w-full h-full bg-white">
                  <div className="absolute inset-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                </div>
                <div className="sticky top-0 w-full h-18 flex items-center justify-between gap-4 p-4 border-b border-gray-200">
                  <Navbar />
                </div>
                <main className="flex-grow w-full">
                  <div className="md:px-10 px-6 w-full min-h-[calc(100vh-73px)]">
                    {children}
                  </div>
                </main>
                <Toaster richColors />
                {modal}
              </div>
              <ChatbotWidget />
            </body>
          </PHProvider>
        </TooltipProvider>
      </ClerkProvider>
    </html>
  );
}
