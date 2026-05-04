import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const dataFont = Space_Grotesk({
  variable: "--font-data",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuySim | See your listing through your buyer's eyes",
  description: "AI-powered buying simulation for Amazon sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${dataFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
