"use client";

import React from "react";
import { RecipesProvider } from "@/contexts/RecipesProvider";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return <RecipesProvider>{children}</RecipesProvider>;
}
