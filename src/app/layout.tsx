import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life RPG - Gamify Your Life",
  description: "Transform your daily life into an RPG adventure with character progression, quest management, ADHD support, and brain dump processing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <UserProvider>
            {children}
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
