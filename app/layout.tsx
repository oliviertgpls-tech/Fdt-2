import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-white text-gray-900">
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="font-semibold text-lg">
              🍽️ Carnets Familiaux
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/library" 
                className="hover:text-blue-600 transition-colors"
              >
                📚 Mes Carnets
              </Link>
              <Link 
                href="/recipes" 
                className="hover:text-blue-600 transition-colors"
              >
                📝 Mes Recettes
              </Link>
              <Link 
                href="/add" 
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Ajouter
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
