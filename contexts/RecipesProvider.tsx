"use client";

import React, { createContext, useContext, useState } from "react";
import type { Recipe, Book } from "@/lib/types";

// 🍽️ Recettes familiales modernes par défaut
const initialRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Risotto aux champignons crémeux",
    description: "Un classique italien réconfortant, parfait pour les soirées d'automne",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1200",
    ingredients: [
      "300g de riz Arborio",
      "400g de champignons de Paris et shiitakés mélangés",
      "1L de bouillon de légumes chaud",
      "150ml de vin blanc sec",
      "1 oignon blanc finement haché",
      "3 gousses d'ail hachées",
      "100g de parmesan fraîchement râpé",
      "50g de beurre",
      "3 cuillères à soupe d'huile d'olive",
      "Persil plat frais",
      "Sel et poivre noir du moulin"
    ],
    steps: `Nettoyer et émincer les champignons. Les faire revenir dans une poêle avec un peu d'huile jusqu'à ce qu'ils soient dorés. Réserver.

Dans une casserole, faire revenir l'oignon dans l'huile d'olive jusqu'à ce qu'il soit translucide. Ajouter l'ail et cuire 1 minute.

Ajouter le riz et nacrer pendant 2 minutes en remuant. Verser le vin blanc et laisser évaporer.

Ajouter le bouillon chaud louche par louche, en remuant constamment. Attendre que le liquide soit absorbé avant d'ajouter la suivante.

Après 18 minutes, incorporer les champignons, le beurre et le parmesan. Rectifier l'assaisonnement.

Servir immédiatement avec du persil frais et du parmesan supplémentaire.`,
    author: "Maman",
    prepMinutes: 35,
    servings: "4",
    tags: ["italien", "végétarien", "réconfortant"],
    createdAt: Date.now() - 432000000
  },
  {
    id: "r2",
    title: "Poulet rôti aux herbes de Provence",
    description: "Le poulet du dimanche revisité avec des saveurs méditerranéennes",
    imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=1200",
    ingredients: [
      "1 poulet fermier de 1,5kg",
      "2 citrons bio",
      "4 gousses d'ail",
      "2 cuillères à soupe d'herbes de Provence",
      "3 cuillères à soupe d'huile d'olive",
      "500g de pommes de terre nouvelles",
      "200g de tomates cerises",
      "1 branche de romarin",
      "Fleur de sel et poivre"
    ],
    steps: `Préchauffer le four à 200°C. Rincer et sécher le poulet.

Mélanger l'huile d'olive, les herbes de Provence, l'ail haché, le zeste d'un citron, sel et poivre.

Badigeonner le poulet avec ce mélange, en glissant un peu sous la peau.

Couper les pommes de terre en deux, les disposer autour du poulet avec les tomates cerises.

Glisser les demi-citrons et le romarin dans la cavité du poulet.

Enfourner 1h15. Arroser régulièrement avec le jus de cuisson.

Vérifier la cuisson en piquant la cuisse : le jus doit être clair.

Laisser reposer 10 minutes avant de découper.`,
    author: "Papa",
    prepMinutes: 90,
    servings: "4-6",
    tags: ["plat principal", "familial", "méditerranéen"],
    createdAt: Date.now() - 345600000
  },
  {
    id: "r3",
    title: "Tarte tatin aux pommes caramélisées",
    description: "Le dessert français incontournable, avec sa pâte croustillante et ses pommes fondantes",
    imageUrl: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?q=80&w=1200",
    ingredients: [
      "1 pâte brisée maison ou du commerce",
      "8 pommes Granny Smith",
      "150g de sucre en poudre",
      "50g de beurre salé",
      "1 cuillère à café d'extrait de vanille",
      "1 pincée de cannelle",
      "Crème fraîche épaisse pour servir"
    ],
    steps: `Préchauffer le four à 180°C. Éplucher et couper les pommes en quartiers.

Dans une poêle allant au four (ou moule tatin), faire un caramel avec le sucre à sec jusqu'à obtenir une couleur ambrée.

Retirer du feu, ajouter le beurre et la vanille. Mélanger délicatement.

Disposer les quartiers de pommes en rosace sur le caramel, bien serrés. Saupoudrer de cannelle.

Cuire 10 minutes sur le feu pour caraméliser le dessous des pommes.

Recouvrir de pâte en rentrant bien les bords. Piquer avec une fourchette.

Enfourner 25-30 minutes jusqu'à ce que la pâte soit dorée.

Laisser tiédir 5 minutes puis démouler d'un geste franc sur un plat de service.`,
    author: "Mamie Louise",
    prepMinutes: 60,
    servings: "6-8",
    tags: ["dessert", "traditionnel", "français"],
    createdAt: Date.now() - 259200000
  },
  {
    id: "r4",
    title: "Salade de quinoa aux légumes grillés",
    description: "Salade complète et colorée, parfaite pour un déjeuner sain et savoureux",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200",
    ingredients: [
      "200g de quinoa tricolore",
      "1 courgette moyenne",
      "1 aubergine",
      "1 poivron rouge",
      "1 poivron jaune",
      "200g de tomates cerises",
      "100g de feta émiettée",
      "50g de pignons de pin grillés",
      "Roquette fraîche",
      "4 cuillères à soupe d'huile d'olive",
      "2 cuillères à soupe de vinaigre balsamique",
      "1 cuillère à café de miel",
      "Basilic frais, sel, poivre"
    ],
    steps: `Rincer le quinoa et le cuire dans 1,5 fois son volume d'eau salée pendant 15 minutes. Égoutter et laisser refroidir.

Couper tous les légumes en cubes réguliers. Les badigeonner d'huile d'olive, saler et poivrer.

Griller les légumes au four à 200°C pendant 25 minutes ou sur une plancha.

Préparer la vinaigrette en mélangeant huile d'olive, vinaigre balsamique, miel, sel et poivre.

Dans un grand saladier, mélanger le quinoa refroidi avec les légumes grillés.

Ajouter la roquette, la feta émiettée et les pignons grillés.

Arroser de vinaigrette et parsemer de basilic frais ciselé.

Servir à température ambiante ou légèrement tiède.`,
    author: "Léa",
    prepMinutes: 45,
    servings: "4",
    tags: ["salade", "végétarien", "healthy"],
    createdAt: Date.now() - 172800000
  },
  {
    id: "r5",
    title: "Moelleux au chocolat cœur coulant",
    description: "Le dessert qui fait fondre, avec son cœur de chocolat qui s'écoule à chaque bouchée",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200",
    ingredients: [
      "200g de chocolat noir 70%",
      "200g de beurre doux",
      "4 œufs entiers",
      "100g de sucre en poudre",
      "50g de farine",
      "1 pincée de sel",
      "Beurre et sucre pour les ramequins",
      "Glace vanille pour servir"
    ],
    steps: `Préchauffer le four à 200°C. Beurrer 6 ramequins et les saupoudrer de sucre.

Faire fondre le chocolat et le beurre au bain-marie ou au micro-ondes par intervalles de 30 secondes.

Battre les œufs avec le sucre jusqu'à blanchiment. Ajouter le mélange chocolat-beurre tiédi.

Incorporer délicatement la farine et la pincée de sel avec une spatule.

Répartir la pâte dans les ramequins. Ils peuvent être préparés à l'avance et conservés au frais.

Enfourner 12 minutes : l'extérieur doit être cuit mais le centre encore mou.

Laisser reposer 1 minute puis démouler délicatement sur les assiettes de service.

Servir immédiatement avec une boule de glace vanille.`,
    author: "Tante Sophie",
    prepMinutes: 25,
    servings: "6",
    tags: ["dessert", "chocolat", "gourmand"],
    createdAt: Date.now() - 86400000
  }
];

// 📚 Pas de carnets/livres au départ
const initialNotebooks: Book[] = [];

// Type pour les livres imprimables (différent des carnets)
type PrintableBook = {
  id: string;
  title: string;
  description?: string;
  recipeIds: string[];
  templateStyle?: string;
  status: 'draft' | 'ready' | 'ordered' | 'printed';
  createdAt: number;
  updatedAt?: number;
};

const initialPrintableBooks: PrintableBook[] = [];

type RecipesContextType = {
  // 🍽️ RECETTES
  recipes: Recipe[];
  addRecipe: (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, recipeData: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // 📚 CARNETS (collections thématiques)
  notebooks: Book[];
  createNotebook: (title: string, description?: string) => Book;
  addRecipeToNotebook: (notebookId: string, recipeId: string) => void;
  removeRecipeFromNotebook: (notebookId: string, recipeId: string) => void;
  
  // 📖 LIVRES IMPRIMABLES (versions print avec recettes sélectionnées)
  books: PrintableBook[];
  createBook: (title: string, selectedRecipeIds: string[]) => PrintableBook;
  addRecipeToBook: (bookId: string, recipeId: string) => void;
  removeRecipeFromBook: (bookId: string, recipeId: string) => void;
};

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [notebooks, setNotebooks] = useState<Book[]>(initialNotebooks);
  const [books, setBooks] = useState<PrintableBook[]>(initialPrintableBooks);

  // 🍽️ GESTION DES RECETTES
  function addRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt'>) {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `r-${Date.now()}`,
      createdAt: Date.now()
    };
    setRecipes(prev => [newRecipe, ...prev]);
  }

  function updateRecipe(id: string, recipeData: Partial<Recipe>) {
    setRecipes(prev =>
      prev.map(recipe =>
        recipe.id === id
          ? { ...recipe, ...recipeData, updatedAt: Date.now() }
          : recipe
      )
    );
  }

  function deleteRecipe(id: string) {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    
    // Nettoyer les carnets et livres
    setNotebooks(prev =>
      prev.map(notebook => ({
        ...notebook,
        recipeIds: notebook.recipeIds.filter(recipeId => recipeId !== id),
        updatedAt: Date.now()
      }))
    );
    
    setBooks(prev =>
      prev.map(book => ({
        ...book,
        recipeIds: book.recipeIds.filter(recipeId => recipeId !== id),
        updatedAt: Date.now()
      }))
    );
  }

  // 📚 GESTION DES CARNETS (collections thématiques)
  function createNotebook(title: string, description?: string): Book {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error('Title is required');

    const newNotebook: Book = {
      id: `notebook-${Date.now()}`,
      title: trimmedTitle,
      description: description?.trim(),
      recipeIds: [],
      createdAt: Date.now()
    };

    setNotebooks(prev => [newNotebook, ...prev]);
    return newNotebook;
  }

  function addRecipeToNotebook(notebookId: string, recipeId: string) {
    setNotebooks(prev =>
      prev.map(notebook => {
        if (notebook.id === notebookId && !notebook.recipeIds.includes(recipeId)) {
          return {
            ...notebook,
            recipeIds: [...notebook.recipeIds, recipeId],
            updatedAt: Date.now()
          };
        }
        return notebook;
      })
    );
  }

  function removeRecipeFromNotebook(notebookId: string, recipeId: string) {
    setNotebooks(prev =>
      prev.map(notebook =>
        notebook.id === notebookId
          ? { 
              ...notebook, 
              recipeIds: notebook.recipeIds.filter(id => id !== recipeId),
              updatedAt: Date.now()
            }
          : notebook
      )
    );
  }

  // 📖 GESTION DES LIVRES IMPRIMABLES
  function createBook(title: string, selectedRecipeIds: string[]): PrintableBook {
    const newBook: PrintableBook = {
      id: `book-${Date.now()}`,
      title: title.trim(),
      recipeIds: [...selectedRecipeIds],
      templateStyle: 'classic',
      status: 'draft',
      createdAt: Date.now()
    };

    setBooks(prev => [newBook, ...prev]);
    return newBook;
  }

  function addRecipeToBook(bookId: string, recipeId: string) {
    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId && !book.recipeIds.includes(recipeId)) {
          return {
            ...book,
            recipeIds: [...book.recipeIds, recipeId],
            updatedAt: Date.now()
          };
        }
        return book;
      })
    );
  }

  function removeRecipeFromBook(bookId: string, recipeId: string) {
    setBooks(prev =>
      prev.map(book =>
        book.id === bookId
          ? { 
              ...book, 
              recipeIds: book.recipeIds.filter(id => id !== recipeId),
              updatedAt: Date.now()
            }
          : book
      )
    );
  }

  return (
    <RecipesContext.Provider
      value={{
        // Recettes
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        
        // Carnets (collections thématiques)
        notebooks,
        createNotebook,
        addRecipeToNotebook,
        removeRecipeFromNotebook,
        
        // Livres (versions imprimables)
        books,
        createBook,
        addRecipeToBook,
        removeRecipeFromBook,
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error("useRecipes doit être utilisé dans un RecipesProvider");
  }
  return context;
}
