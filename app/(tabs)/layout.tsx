"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, SessionProvider } from "next-auth/react";
import { RecipesProvider } from "@/contexts/RecipesProvider";
import { ToastProvider } from '@/components/Toast';


function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fonction pour vérifier si un lien est actif
  const isActive = (path: string) => pathname === path;

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
        <div className="min-h-screen bg-primary-50">
          <header className="sticky top-0 z-50 border-b bg-white backdrop-blur shadow-md">
           <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3">
  
            {/* Desktop : Logo + Menu + rien à droite */}
            <div className="hidden md:flex items-center gap-8 flex-1">
              <Link href="/recipes" className="font-semibold text-lg">
                RiCiPiZ
              </Link>
              
              <div className="flex items-center gap-6 text-sm">
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
             
            </div>

            {/* Mobile : Burger à gauche */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
            >
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>

            {/* Mobile : Logo au centre */}
            <Link href="/recipes" className=" md:hidden font-semibold text-base">
              RiCiPiZ
            </Link>

            {/* Mobile : Bouton nouvelle recette à droite */}
            <Link
              href="/add"
              className="md:hidden border text-primary-600 px-3 py-1 rounded-lg text-lg font-medium transition-colors"
            >
              +
            </Link>

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

        {/* Footer */}
        <footer className="border-t bg-white mt-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
              <p>
                © {new Date().getFullYear()} Ricipiz - Préservez votre patrimoine culinaire
              </p>
            </div>
          </div>
        </footer>
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