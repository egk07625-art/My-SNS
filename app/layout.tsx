import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ModalBackgroundContent } from "@/components/auth/ModalBackgroundContent";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { logEnvValidation } from "@/lib/utils/env-validation";
import "./globals.css";

// 개발 환경에서만 환경 변수 검증 실행
if (process.env.NODE_ENV === "development") {
  logEnvValidation();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR} appearance={clerkAppearance}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {/* Desktop & Tablet: Sidebar (모든 페이지에서 표시) */}
            <Sidebar />
            <ModalBackgroundContent />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
