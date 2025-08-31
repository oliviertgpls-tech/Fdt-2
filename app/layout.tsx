import "./globals.css";
import type { Metadata } from "next";
import { RecipesProvider } from "./providers"; // <— AJOUT

export const metadata: Metadata = {
  title: "Carnet Recettes",
  description: "Proto Next.js + Tailwind",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <RecipesProvider> {/* <— AJOUT */}
          {children}
        </RecipesProvider>
      </body>
    </html>
  );
}
