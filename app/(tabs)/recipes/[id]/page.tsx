"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import { OptimizedImage } from "@/components/OptimizedImage"; // 🆕 IMPORT
import Link from "next/link";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, deleteRecipe, books, addRecipeToBook } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

  // État pour gérer l'étape courante
  const [currentStep, setCurrentStep] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(true);

  // États pour l'ajout au livre
  const [showBookModal, setShowBookModal] = useState(false);

  if (!recipe) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Recette introuvable.</p>
        <Link 
          href="/recipes" 
          className="text-primary-600 underline hover:text-primary-700"
        >
          ← Retour à la liste des recettes
        </Link>
      </div>
    );
  }

  // Fonction pour ajouter au livre
  const handleAddToBook = () => {
    if (books.length === 0) {
      alert("Créez d'abord un livre pour ajouter cette recette !");
      router.push("/livres");
      return;
    }
    
    if (books.length
