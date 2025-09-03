import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-white text-gray-900">
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="font-semibold">FDT #2</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/notebooks" className="hover:underline">Carnets</Link>
              <Link href="/recipes" className="hover:underline">Recettes</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
