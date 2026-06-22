import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { QuestionsProvider } from "@/context/QuestionsContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CeMAP Practice Questions",
  description: "Interactive CeMAP Part 1 practice tests and exam simulations",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full bg-white font-sans text-blue-950 antialiased">
        <QuestionsProvider>
          <SiteNav />
          <main className="min-h-full">{children}</main>
        </QuestionsProvider>
      </body>
    </html>
  );
}
