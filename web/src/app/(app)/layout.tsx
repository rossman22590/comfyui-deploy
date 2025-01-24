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
    <html lang="en" className="scroll-smooth min-h-screen bg-white">
      {/* If you're injecting <head> stuff, do it here */}
      <ClerkProvider>
        <TooltipProvider>
          {/* Conditionally render Plausible head tags */}
          {process.env.PLAUSIBLE_DOMAIN && (
            <head>
              <PlausibleProvider domain={process.env.PLAUSIBLE_DOMAIN} />
            </head>
          )}
          <PHProvider>
            {/* 
              Use min-h-screen (not h-full) on <body> so the page can actually scroll.
              Also remove the extra flex/fixed background containers that can interfere. 
            */}
            <body className={`${inter.className} min-h-screen flex flex-col relative`}>
              <PostHogPageView />

              {/*
                Place your background as absolutely positioned, behind the content.
                -z-10 ensures it's *behind* everything else, but doesn't hijack scroll.
              */}
              <div className="absolute inset-0 -z-10 w-full h-full bg-white">
                <div
                  className="absolute inset-0 w-full h-full
                  bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]
                  [background-size:16px_16px]
                  [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
                />
              </div>

              {/*
                Now your navbar can be sticky since the parent is scrollable 
                and there's no fixed container interfering.
              */}
              <div className="sticky top-0 w-full h-18 flex items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white z-50">
                <Navbar />
              </div>

              <main className="flex-grow w-full">
                <div className="md:px-10 px-6 w-full min-h-[calc(100vh-73px)]">
                  {children}
                </div>
              </main>

              <Toaster richColors />
              {modal}

              <ChatbotWidget />
            </body>
          </PHProvider>
        </TooltipProvider>
      </ClerkProvider>
    </html>
  );
}
