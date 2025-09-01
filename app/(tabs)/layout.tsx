import Link from "next/link";
import { ChefHat, BookOpen, Plus, User } from "lucide-react";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <ul className="mx-auto flex max-w-5xl items-center gap-2 p-3">
          <li>
            <Link
              href="/recipes"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <ChefHat size={16} />
              <span>Recettes</span>
            </Link>
          </li>
          <li>
            <Link
              href="/library"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <BookOpen size={16} />
              <span>Bibliothèque</span>
            </Link>
          </li>
          <li>
            <Link
              href="/add"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <Plus size={16} />
              <span>Ajouter</span>
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <User size={16} />
              <span>Profil</span>
            </Link>
          </li>
        </ul>
      </nav>

      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
