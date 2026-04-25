import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casework.AI",
  description:
    "The operating system for Congressional casework. Built at c0mpiled-10/DC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-black/10 bg-paper">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block w-2 h-6 bg-ink" />
              <span className="font-serif text-xl tracking-tight">Casework.AI</span>
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/inbox" className="hover:underline">Inbox</Link>
              <Link href="/patterns" className="hover:underline">Patterns</Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-black/60"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        <footer className="max-w-7xl mx-auto px-6 py-8 text-xs text-black/50">
          Casework.AI · built at c0mpiled-10/DC: AI for Government · Apr 24, 2026
        </footer>
      </body>
    </html>
  );
}
