"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RecipesProvider } from "@/contexts/RecipesProvider";
import { ToastProvider } from '@/components/Toast';

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Protection : rediriger si pas connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Affichage loading pendant vérification
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Si pas de session, pas d'affichage (redirection en cours)
  if (!session) {
    return null;
  }

  // Ton layout actuel avec menu
  return (
  <ToastProvider>
    <RecipesProvider>
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3">
            <Link href="/recipes" className="font-semibold text-base md:text-lg">
              FOOD MEMORIES
            </Link>
            
            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link 
                href="/recipes" 
                className="hover:text-orange-600 transition-colors"
              >
                Mes Recettes
              </Link>
               <Link 
                href="/carnets" 
                className="hover:text-orange-600 transition-colors"
              >
                Mes Carnets
              </Link>
              <Link 
                href="/livres" 
                className="hover:text-orange-600 transition-colors"
              >
                Mes Livres
              </Link>
              <Link 
                href="/profile"
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Mon compte
              </Link>
            </div>

            {/* Menu mobile button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
              aria-label="Menu"
            >
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </nav>

          {/* Menu mobile dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur">
              <div className="px-4 py-3 space-y-3">
                <Link 
                  href="/recipes"
                  className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Recettes
                </Link>
                <Link 
                  href="/carnets"
                  className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Carnets
                </Link>
                <Link 
                  href="/livres"
                  className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Livres
                </Link>
                <Link 
                  href="/profile"
                  className="block py-2 text-orange-600 font-medium hover:text-orange-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon Compte
                </Link>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-6xl px-4 md:px-6 py-4 md:py-8">
          {children}
        </main>
      </div>
    </RecipesProvider>
  </ToastProvider>
  );
}

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedContent>
      {children}
    </ProtectedContent>
  );
}
