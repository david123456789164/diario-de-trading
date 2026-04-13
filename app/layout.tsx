import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Hebrew, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { I18nToaster } from "@/components/i18n/i18n-toaster";
import { getServerTranslation } from "@/src/i18n/server";

const fontSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontHebrew = IBM_Plex_Sans_Hebrew({
  variable: "--font-hebrew",
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
});

const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslation();

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { language, dir } = await getServerTranslation();

  return (
    <html lang={language} dir={dir} className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontHebrew.variable} ${fontDisplay.variable} bg-background font-sans text-text antialiased`}
      >
        <I18nProvider initialLanguage={language}>
          {children}
          <I18nToaster />
        </I18nProvider>
      </body>
    </html>
  );
}
