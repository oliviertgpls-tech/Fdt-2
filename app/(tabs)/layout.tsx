'use client';

import React from "react";

// 👉 ici on importe ton RecipesProvider (c’est lui qui évite l’erreur).
// S’il n’existe pas encore, colle ce fichier aussi juste après.
import { RecipesProvider } from "@/contexts/RecipesProvider";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return <RecipesProvider>{children}</RecipesProvider>;
}
