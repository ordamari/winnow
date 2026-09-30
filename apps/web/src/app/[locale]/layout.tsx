import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Heebo } from "next/font/google";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@winnow/ui/components/tooltip";
import { Toaster } from "@winnow/ui/components/sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("shell");
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-svh">
        <NextIntlClientProvider>
          <ThemeProvider>
            <TooltipProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-3 focus:ring-ring"
              >
                {t("skipToContent")}
              </a>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
