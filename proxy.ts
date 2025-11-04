import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * @file proxy.ts
 * @description Next.js 16에서 middleware.ts가 proxy.ts로 변경됨
 *
 * Next.js 16부터 middleware 파일이 proxy로 변경되었습니다.
 * 기존 middleware.ts의 기능을 그대로 유지합니다.
 */

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

