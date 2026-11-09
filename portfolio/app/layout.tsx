import type { Metadata } from "next";
import { Inter_Tight, Newsreader } from "next/font/google";
import type { ReactNode } from "react";

import SiteNav from "@/components/SiteNav";

import "./globals.css";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const body = Inter_Tight({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "Zoe Wang - Pick a lens", template: "%s · Zoe Wang" },
  description: "Zoe Wang. Making AI products easy to get.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SiteNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
