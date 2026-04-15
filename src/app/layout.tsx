import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brainstorm — Gestion de projets",
  description: "Pilote tes projets de l'idée au lancement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#E8E0D8" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c0c14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
