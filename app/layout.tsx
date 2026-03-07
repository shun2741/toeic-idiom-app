import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

import "@/app/globals.css";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TOEIC Idiom Coach",
  description: "TOEIC英熟語を自由入力で学ぶ、復習付きの学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={nunito.variable}>{children}</body>
    </html>
  );
}
