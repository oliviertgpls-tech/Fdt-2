import Link from "next/link";
import { ChefHat, BookOpen, Plus, User } from "lucide-react";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-3">
          <div className="font-semibold text-brand">Livre de famille</div>
          <nav>
            <ul className="flex items-center gap-2">
              <li>
                <Link href="/recipes" className="px-3 py-2 hover:underline">Recettes</Link>
              </li>
              <li>
                <Link href="/library" className="px-3 py-2 hover:underline">Bibliothèque</Link>
              </li>
              <li>
                <Link href="/add" className="px-3 py-2 hover:underline">Ajouter</Link>
              </li>
              <li>
                <Link href="/profile" className="px-3 py-2 hover:underline">Profil</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
