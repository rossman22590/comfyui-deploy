import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // debug: true,
  publicRoutes: [
    "/", 
    "/api/(.*)", 
    "/docs(.*)", 
    "/share(.*)", 
    "/chat(.*)",
    "/your-ph-address/(.*)", // Make PostHog tracking endpoints public
  ],
  // publicRoutes: ["/", "/(.*)"],
  async afterAuth(auth, req, evt) {
    // redirect them to organization selection page
    const userId = auth.userId;

    // Parse the URL to get the pathname
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Handle CORS preflight requests for PostHog and Clerk
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Handle PostHog endpoints directly
    if (pathname.startsWith("/your-ph-address")) {
      // Return 200 for PostHog tracking endpoints to prevent errors
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    if (
      !auth.userId &&
      !auth.isPublicRoute
      // ||
      // pathname === "/create" ||
      // pathname === "/history" ||
      // pathname.startsWith("/edit")
    ) {
      const url = new URL(req.url);
      return redirectToSignIn({ returnBackUrl: url.origin });
    }

    // Apply CORS headers to all responses
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    return response;
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/",
    "/(api|trpc)(.*)",
    "/your-ph-address/(.*)", // Add PostHog endpoints to the matcher
  ],
  // matcher: ['/','/create', '/api/(twitter|generation|init|voice-cloning)'],
};
