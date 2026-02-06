import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WPL Tracking Portal",
  description: "Wen-Parker Logistics shipment tracking portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="bg-[var(--wpl-navy)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/wpl-logo.png"
                alt="Wen-Parker Logistics"
                width={180}
                height={54}
                priority
              />
              <span className="hidden text-sm font-medium text-white/80 md:inline">
                Tracking Portal
              </span>
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Sign in
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-10 border-t border-[var(--wpl-border)] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-[var(--wpl-gray)]">
            © {new Date().getFullYear()} Wen-Parker Logistics
          </div>
        </footer>
      </body>
    </html>
  );
}
