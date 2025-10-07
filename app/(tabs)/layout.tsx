"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { RecipesProvider } from "@/contexts/RecipesProvider";
import { ToastProvider } from '@/components/Toast';

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Affichage loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Si pas de session, afficher un message simple (pas de redirection !)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Non connecté</h2>
          <Link href="/auth/signin" className="text-blue-600">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Utilisateur connecté, afficher le contenu
  return (
    <ToastProvider>
      <RecipesProvider>
        <div className="min-h-screen bg-white">
          <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3">
              <Link href="/recipes" className="font-semibold text-base md:text-lg">
                RICIPIZ
              </Link>
              
              <div className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/recipes" className="hover:text-orange-600 transition-colors">
                  Mes Recettes
                </Link>
                <Link href="/carnets" className="hover:text-orange-600 transition-colors">
                  Mes Carnets
                </Link>
                <Link href="/livres" className="hover:text-orange-600 transition-colors">
                  Mes Livres
                </Link>
                <Link href="/profile" className="hover:text-orange-600 transition-colors">
                  Mon compte
                </Link>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex flex-col gap-1 p-2"
              >
                <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </button>
            </nav>

            {isMenuOpen && (
              <div className="md:hidden border-t bg-white/95 backdrop-blur">
                <div className="px-4 py-3 space-y-3">
                  <Link href="/recipes" className="block py-2 text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>
                    Mes Recettes
                  </Link>
                  <Link href="/carnets" className="block py-2 text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>
                    Mes Carnets
                  </Link>
                  <Link href="/livres" className="block py-2 text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>
                    Mes Livres
                  </Link>
                  <Link href="/profile" className="block py-2 text-gray-700 hover:text-orange-600 " onClick={() => setIsMenuOpen(false)}>
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
      <SessionProvider 
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        <ProtectedContent>
          {children}
        </ProtectedContent>
      </SessionProvider>
    );
  }