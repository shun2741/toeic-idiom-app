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
  description: "TOEIC 英熟語を反復学習し、復習キューで定着させる学習サービス",
  robots: {
    index: false,
    follow: false,
  },
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
