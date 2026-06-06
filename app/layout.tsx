import type { Metadata } from "next";
import { Barlow, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "King of the Beach | Sigulda Beach",
  description: "Noskaidro, kas ir uzvarētājs pludmales volejbola laukumā!",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv" className="dark" suppressHydrationWarning={true}>
      <body
        className={`${barlow.variable} ${oswald.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
