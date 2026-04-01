import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import QueryProvider from "@/components/providers/query-provider";
import { OverlayProvider } from "@/lib/overlay-context";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IOMS — Inventory & Order Management System",
  description: "Advanced inventory and order management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <OverlayProvider>
            <AuthProvider>{children}</AuthProvider>
          </OverlayProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
