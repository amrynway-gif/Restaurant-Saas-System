import type { Metadata } from "next";
import { Cairo, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionHashHandler } from "@/components/auth/SessionHashHandler";
import { Toaster } from "sonner";
import "./globals.css";


const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});


const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Restaurant SaaS",
  description: "Multi-tenant restaurant menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-theme="dark" suppressHydrationWarning className="transition-colors duration-300">
      <body
        className={`${cairo.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
            <SessionHashHandler />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
