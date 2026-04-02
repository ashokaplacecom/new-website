import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar1 } from "@/components/navbar1";
import { TooltipProvider } from "@/components/ui/tooltip";
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Connect Placement Committee",
  description: "The official website of the Placement Committee of Ashoka University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased px-6 py-3`}
      >
        <TooltipProvider>
          <Navbar1 />
          {children}
          <Footer />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
