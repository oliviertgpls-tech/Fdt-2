import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server';

// Types pour la réponse
type ExtractResult = {
  success: boolean;
  source: 'auto' | 'manual_needed';
  recipe?: {
    title: string;
    ingredients: string[];
    steps: string;
    image?: string;
    author?: string;
    prepMinutes?: number;
    servings?: string;
  };
  error?: string;
  platform?: string;
};

// Détection du type de site
function detectPlatform(url: string): string {
  const domain = new URL(url).hostname.toLowerCase();
  
  if (domain.includes('pinterest.com') || domain.includes('pin.it')) return 'pinterest';
  if (domain.includes('instagram.com')) return 'instagram';
  if (domain.includes('tiktok.com')) return 'tiktok';
  if (domain.includes('marmiton.org')) return 'marmiton';
  if (domain.includes('750g.com')) return '750g';
  if (domain.includes('cuisineaz.com')) return 'cuisineaz';
  
  // Sites de recettes génériques
  const recipeSites = ['allrecipes.com', 'food.com', 'epicurious.com', 'bon-appetit.com'];
  if (recipeSites.some(site => domain.includes(site))) return 'recipe_site';
  
  return 'unknown';
}

// Extraction de métadonnées JSON-LD (format standard des recettes)
async function extractJsonLD(html: string): Promise<any> {
  // Recherche des balises script JSON-LD
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  let match;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      
      // Vérifier si c'est une recette
      if (jsonData['@type'] === 'Recipe' || 
          (Array.isArray(jsonData) && jsonData.some(item => item['@type'] === 'Recipe'))) {
        return Array.isArray(jsonData) ? jsonData.find(item => item['@type'] === 'Recipe') : jsonData;
      }
    } catch (e) {
      // JSON invalide, continuer
      continue;
    }
  }
  
  return null;
}

// Extraction spécialisée Pinterest
function extractPinterestData(html: string): Partial<ExtractResult['recipe']> {
  const result: Partial<ExtractResult['recipe']> = {};
  
  // Pinterest stocke souvent les données dans des scripts React
  const pinterestDataRegex = /"description":\s*"([^"]+)"/g;
  const matches = Array.from(html.matchAll(pinterestDataRegex));
  
  if (matches.length > 0) {
    // Prendre la description la plus longue (probablement la recette)
    const descriptions = matches.map(m => m[1]).sort((a, b) => b.length - a.length);
    const mainDescription = descriptions[0];
    
    if (mainDescription && mainDescription.length > 50) {
      result.steps = mainDescription.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }
  
  // Extraction des ingrédients depuis la description
  if (result.steps) {
    const lines = result.steps.split('\n').map(line => line.trim()).filter(Boolean);
    const ingredients: string[] = [];
    const steps: string[] = [];
    
    for (const line of lines) {
      // Heuristique : les lignes courtes avec des mesures sont probablement des ingrédients
      if (line.length < 100 && (line.includes('cup') || line.includes('tsp') || line.includes('tbsp') || 
          line.includes('ml') || line.includes('g ') || line.includes('kg') || line.match(/^\d/))) {
        ingredients.push(line);
      } else if (line.length > 20) {
        steps.push(line);
      }
    }
    
    if (ingredients.length > 0) {
      result.ingredients = ingredients;
      result.steps = steps.join('\n\n');
    }
  }
  
  return result;
}

// Extraction basique HTML (fallback)
function extractBasicHTML(html: string): Partial<ExtractResult['recipe']> {
  const result: Partial<ExtractResult['recipe']> = {};
  
  // Titre de la page
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].replace(/&[^;]+;/g, '').trim();
  }
  
  // Images (recherche meta og:image)
  const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (imageMatch) {
    result.image = imageMatch[1];
  }
  
  return result;
}

// Scraping spécialisé selon la plateforme
async function extractFromPlatform(url: string, platform: string): Promise<ExtractResult> {
  try {
    // Récupération du HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Tentative d'extraction JSON-LD d'abord
    const jsonLdData = await extractJsonLD(html);
    
    if (jsonLdData) {
      // Conversion des données JSON-LD
      return {
        success: true,
        source: 'auto',
        platform,
        recipe: {
          title: jsonLdData.name || 'Recette importée',
          ingredients: Array.isArray(jsonLdData.recipeIngredient) 
            ? jsonLdData.recipeIngredient 
            : (jsonLdData.recipeIngredient ? [jsonLdData.recipeIngredient] : []),
          steps: Array.isArray(jsonLdData.recipeInstructions) 
            ? jsonLdData.recipeInstructions.map((step: any) => 
                typeof step === 'string' ? step : step.text || step.name || ''
              ).join('\n\n')
            : (jsonLdData.recipeInstructions || ''),
          image: Array.isArray(jsonLdData.image) 
            ? jsonLdData.image[0] 
            : (typeof jsonLdData.image === 'object' ? jsonLdData.image?.url : jsonLdData.image),
          author: jsonLdData.author?.name || jsonLdData.author || undefined,
          prepMinutes: jsonLdData.prepTime ? parseISO8601Duration(jsonLdData.prepTime) : undefined,
          servings: jsonLdData.recipeYield?.toString() || jsonLdData.yield?.toString() || undefined
        }
      };
    }
    
    // Extraction spécialisée Pinterest si pas de JSON-LD
    if (platform === 'pinterest') {
      const pinterestData = extractPinterestData(html);
      const basicData = extractBasicHTML(html);
      
      if (pinterestData.steps || pinterestData.ingredients) {
        return {
          success: true,
          source: 'auto',
          platform,
          recipe: {
            title: basicData.title || 'Recette Pinterest',
            ingredients: pinterestData.ingredients || [],
            steps: pinterestData.steps || 'Étapes extraites depuis Pinterest',
            image: basicData.image,
            author: 'Pinterest'
          }
        };
      }
    }
    
    // Fallback sur extraction HTML basique
    const basicData = extractBasicHTML(html);
    
    if (basicData.title) {
      return {
        success: true,
        source: 'auto',
        platform,
        recipe: {
          title: basicData.title,
          ingredients: [],
          steps: 'Recette importée - veuillez compléter les ingrédients et étapes.',
          ...basicData
        }
      };
    }
    
    // Aucune donnée exploitable trouvée
    return {
      success: false,
      source: 'manual_needed',
      platform,
      error: 'Impossible d\'extraire automatiquement le contenu. Saisie manuelle nécessaire.'
    };
    
  } catch (error: any) {
    // Gestion des réseaux sociaux et sites protégés
    if (platform === 'instagram' || platform === 'tiktok' || platform === 'pinterest') {
      return {
        success: false,
        source: 'manual_needed',
        platform,
        error: 'Les réseaux sociaux nécessitent une saisie manuelle pour des raisons de protection des données.'
      };
    }
    
    return {
      success: false,
      source: 'manual_needed',
      platform,
      error: `Erreur lors de l'extraction: ${error.message}`
    };
  }
}

// Parse ISO 8601 duration (ex: PT30M = 30 minutes)
function parseISO8601Duration(duration: string): number | undefined {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (match) {
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    return hours * 60 + minutes;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    // Vérification auth
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL manquante'
      }, { status: 400 });
    }

    // Validation de l'URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'URL invalide'
      }, { status: 400 });
    }

    // Détection de la plateforme
    const platform = detectPlatform(url);
    console.log('🔍 Extraction depuis:', platform, '-', validUrl.hostname);

    // Extraction selon la plateforme
    const result = await extractFromPlatform(url, platform);
    
    console.log('📊 Résultat extraction:', result.success ? 'Succès' : 'Échec', result.source);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erreur API extract-from-url:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      source: 'manual_needed'
    }, { status: 500 });
  }
}