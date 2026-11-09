import type { Metadata } from "next";
import { Caprasimo, Jost } from "next/font/google";

import "./globals.css";

const caprasimo = Caprasimo({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-caprasimo",
});

const jost = Jost({
  weight: ["300", "500"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "PayeTaVie - Assistant administratif personnel",
  description: "Votre assistant pour comprendre et gérer tous les aspects de la vie adulte : impôts, URSSAF, mutuelle, fiches de paie, aides, logement, assurances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${caprasimo.variable} ${jost.variable} font-sans antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
