import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import "@/app/globals.css";

const fontSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Diario de Trading Swing",
  description: "App privada para registrar trades, medir rendimiento y aprender de cada operación.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className={`${fontSans.variable} ${fontDisplay.variable} bg-background font-sans text-text antialiased`}>
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}

