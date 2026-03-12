import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "PayeTaVie - Assistant administratif personnel",
  description: "Votre assistant pour comprendre et gérer tous les aspects de la vie adulte : impôts, URSSAF, mutuelle, fiches de paie, aides, logement, assurances",
};

// Script inline pour éviter le flash au chargement
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('payetavie-theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark);
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${jakarta.variable} font-sans antialiased min-h-screen`}
      >
        <ThemeProvider defaultTheme="system" storageKey="payetavie-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
