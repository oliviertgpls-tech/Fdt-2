// Dans app/(tabs)/livres/[id]/page.tsx - Fonction renderRecipePage améliorée

const renderRecipePage = (recipe: any) => (
  <div className="cookbook-page bg-cream">
    {/* Header discret */}
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-8 z-10">
      <div className="text-xs uppercase tracking-widest text-brown-500 font-medium opacity-70">
        Recettes de Famille
      </div>
      <div className="text-xs text-brown-500 opacity-70">
        {pages.indexOf(`recipe-${recipe.id}`) + 1}
      </div>
    </div>

    {/* Layout principal : Photo gauche + Contenu droite */}
    <div className="h-full grid grid-cols-2 gap-0">
      
      {/* COLONNE GAUCHE - PHOTO PLEINE PAGE */}
      <div className="relative overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title}
          className="w-full h-full object-cover sepia-[0.2] contrast-110 saturate-90"
        />
        {/* Overlay subtil pour améliorer la lisibilité si besoin */}
        <div className="absolute inset-0 bg-brown-900 opacity-5"></div>
        
        {/* Badge qualité photo (pour future fonctionnalité IA) */}
        {recipe.photoQuality === 'low' && (
          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-2 py-1 rounded text-xs">
            ⚠️ Photo à améliorer
          </div>
        )}
      </div>

      {/* COLONNE DROITE - CONTENU RECETTE */}
      <div className="p-12 flex flex-col h-full">
        
        {/* En-tête recette */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-brown-900 mb-4 leading-tight">
            {recipe.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-brown-600 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Par</span>
              <span className="italic text-brown-700">{recipe.author}</span>
            </div>
            <div className="w-px h-4 bg-brown-300"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Préparation</span>
              <span>{recipe.prepMinutes} min</span>
            </div>
            <div className="w-px h-4 bg-brown-300"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Pour</span>
              <span>{recipe.servings}</span>
            </div>
          </div>

          {/* Description courte */}
          <p className="text-brown-600 italic text-sm leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Contenu principal en 2 colonnes */}
        <div className="flex-1 grid grid-cols-5 gap-8">
          
          {/* Ingrédients (2 colonnes) */}
          <div className="col-span-2">
            <h3 className="font-serif text-lg text-brown-900 mb-4 pb-2 border-b border-brown-200">
              Ingrédients
            </h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="w-1 h-1 bg-brown-400 rounded-full mt-2.5 flex-shrink-0"></span>
                  <span className="text-brown-700 leading-relaxed">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Instructions (3 colonnes) */}
          <div className="col-span-3">
            <h3 className="font-serif text-lg text-brown-900 mb-4 pb-2 border-b border-brown-200">
              Préparation
            </h3>
            
            <div className="space-y-4">
              {recipe.steps.map((step: string, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-brown-900 text-cream text-xs font-medium flex items-center justify-center rounded">
                    {index + 1}
                  </div>
                  <p className="text-sm text-brown-700 leading-relaxed flex-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer avec conseil du chef */}
        {recipe.chef_note && (
          <div className="mt-6 pt-4 border-t border-brown-200">
            <div className="bg-brown-50 border-l-2 border-brown-300 p-4">
              <h4 className="font-serif text-sm text-brown-900 mb-2 font-medium">
                Conseil de {recipe.author}
              </h4>
              <p className="text-xs text-brown-600 leading-relaxed italic">
                {recipe.chef_note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
