import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import FacebookPixel from "@/components/analytics/FacebookPixel";

// Sans for UI/body text, serif for headlines (common ecommerce pairing).
const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VÉLORA — Premium Eyewear Store",
    template: "%s | VÉLORA",
  },
  description:
    "Premium sunglasses and eyeglasses. UV400 protection, lightweight frames, exceptional clarity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
