import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ShareHeader } from '@/components/ShareHeader'
import { ShareFooterCTA } from '@/components/ShareFooterCTA'
import { OptimizedImage } from '@/components/OptimizedImage'
import { Clock4, Utensils } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  }
}

async function getSharedRecipe(token: string) {
  const sharedRecipe = await prisma.sharedRecipe.findUnique({
    where: { token },
    include: {
      recipe: true,
      owner: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!sharedRecipe) return null

  // Incrémenter le compteur de vues
  await prisma.sharedRecipe.update({
    where: { token },
    data: { viewCount: { increment: 1 } }
  })

  return {
    recipe: sharedRecipe.recipe,
    ownerName: sharedRecipe.owner.name || sharedRecipe.owner.email?.split('@')[0] || 'Votre ami'
  }
}

export default async function SharedRecipePage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const data = await getSharedRecipe(params.token)
  
  if (!data) {
    notFound()
  }

  const { recipe, ownerName } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <ShareHeader ownerName={ownerName} />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Image de la recette */}
        {recipe.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <OptimizedImage 
                size="large"
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full aspect-[4/3] object-cover"
            />
          </div>
        )}

        {/* Titre */}
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>

        {/* Auteur */}
        {recipe.author && (
          <p className="text-gray-600 mb-4">Par {recipe.author}</p>
        )}

        {/* Métadonnées */}
        <div className="flex items-center gap-4 mb-6 text-gray-700">
          {recipe.prepMinutes && (
            <div className="flex items-center gap-2">
              <Clock4 className="w-5 h-5 text-gray-400" />
              <span>{recipe.prepMinutes} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-gray-400" />
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-700 mb-8">{recipe.description}</p>
        )}

        {/* Ingrédients */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ingrédients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Étapes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Préparation</h2>
          <div className="space-y-4">
            {recipe.steps.split('\n\n').filter(s => s.trim()).map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {recipe.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <ShareFooterCTA />
      </main>
    </div>
  )
}