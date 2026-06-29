import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "A Special Surprise For You! | Happy Birthday 💖",
  description: "A premium magical surprise created just for you. Open to reveal letter, photo memories, interactive games, cake, and fireworks!",
  openGraph: {
    title: "Happy Birthday Surprise!",
    description: "A special virtual birthday present filled with warmth and memories.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050215",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} scroll-smooth antialiased`}
    >
      <body className="bg-dark-bg text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
