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
import React from "react";

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
      {/* Optionally inject <head> stuff for Plausible here */}
      {process.env.PLAUSIBLE_DOMAIN && (
        <head>
          <PlausibleProvider domain={process.env.PLAUSIBLE_DOMAIN} />
        </head>
      )}
      <ClerkProvider>
        <TooltipProvider>
          <PHProvider>
            <body
              className={`${inter.className} min-h-screen flex flex-col relative`}
            >
              <PostHogPageView />

              {/* Background behind everything */}
              <div className="absolute inset-0 -z-10 w-full h-full bg-white">
                <div
                  className="absolute inset-0 w-full h-full
                  bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]
                  [background-size:16px_16px]
                  [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
                />
              </div>

              {/* Sticky Navbar */}
              <div className="sticky top-0 w-full h-18 flex items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white z-50">
                <Navbar />
              </div>

              {/* Main Content */}
              <main className="flex-grow w-full">
                <div className="md:px-10 px-6 w-full min-h-[calc(100vh-73px)]">
                  {children}
                </div>
              </main>

              {/* Global Footer */}
              <footer className="bg-white text-black pt-12 pb-8 w-full border-t border-gray-200">
                <div
                  className="w-full px-6 md:px-12 lg:px-24 max-w-7xl mx-auto"
                  style={{ paddingLeft: "0 !important", paddingRight: "0 !important" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-bold text-xl mb-4">Pixio API</h3>
                      <p className="text-gray-800">Empowering creativity with AI</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Product</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <a
                            href="https://api.myapps.ai/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Features
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://api.myapps.ai/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Pricing
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://api.myapps.ai/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Tutorials
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Company</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <a
                            href="https://api.myapps.ai/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            About
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://support.myapps.ai/api-reference/endpoint/get"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            API Docs
                          </a>
                        </li>
                        <li>
                          <a
                            href="/examples"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Workflows
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Legal</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <a
                            href="http://myapps.ai/privacy-policy/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Privacy
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://myapps.ai/terms-condition/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Terms
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://myapps.ai/terms-condition/"
                            className="relative inline-block transition-all duration-300 hover:text-pink-600
                              before:absolute before:left-1/2 before:bottom-0 before:h-[2px] 
                              before:w-0 before:bg-current before:transition-all before:duration-300
                              hover:before:left-0 hover:before:w-full"
                          >
                            Copyright
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-700">
                    © {new Date().getFullYear()} Pixio API. All rights reserved.
                  </div>
                </div>
              </footer>

              {/* Toast & other modals */}
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
