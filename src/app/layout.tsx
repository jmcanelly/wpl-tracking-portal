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
        <header className="bg-[var(--wpl-navy)] shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                <Image
                  src="/wpl-logo.png"
                  alt="Wen-Parker Logistics"
                  width={180}
                  height={54}
                  priority
                />
              </div>
              <span className="hidden text-sm font-medium text-white/90 md:inline">
                Tracking Portal
              </span>
            </Link>

            {/* Solid white button - much better contrast! */}
            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--wpl-navy)] transition-all hover:bg-white/90 shadow-sm"
            >
              Sign in
            </Link>

            {/* Alternative: Brand red button (uncomment to use this instead)
            <Link
              href="/login"
              className="rounded-lg bg-[var(--wpl-red)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
            >
              Sign in
            </Link>
            */}
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
