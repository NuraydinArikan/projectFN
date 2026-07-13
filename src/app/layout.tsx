import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project FN — Doğrulanabilir haber",
  description:
    "Project FN geliştirme sürümü. Haber, doğrulanabilir bir bilgi nesnesidir. Tüm içerik temsilîdir.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
