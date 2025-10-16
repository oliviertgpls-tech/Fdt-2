// lib/openai.ts - Configuration OpenAI
export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  
  private formatSteps(stepsText: string): string {
    if (!stepsText) return '';
    
    // Découper par phrases qui commencent par Étape ou chiffre
    return stepsText
      .replace(/(Étape\s*\d+)/gi, '\\n\\n$1')
      .replace(/([.!?])\s*(Étape|\d+\.)/g, '$1\\n\\n$2')
      .replace(/^\n\n/, '')
      .trim();
  }
  
  constructor() {
    // Essayer NEXT_PUBLIC d'abord (côté client), puis côté serveur
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
    
    // Ne pas throw d'erreur au chargement, juste logger
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key non configurée - les fonctions IA seront désactivées');
    }
  } 

    // 📷 ANALYSE PHOTO DE PLAT → RECETTE (avec timeout)
async analyzePhotoToRecipe(
  imageFile: File, 
  firstName: string,
  signal?: AbortSignal  // ← Pour annuler
): Promise<{
  title: string;
  author: string;
  prepMinutes: number;
  servings: string;
  ingredients: string[];
  steps: string;
  confidence: number;
}> {
  console.log('🚀 Début analyzePhotoToRecipe');
  
  try {
    // Vérifier la clé API    
    if (!this.apiKey) {
      throw new Error('Clé OpenAI non configurée. Ajoutez NEXT_PUBLIC_OPENAI_API_KEY dans vos variables d\'environnement.');
    }

    // Convertir l'image en base64
    console.log('📸 Conversion image en base64...');
    const base64Image = await this.fileToBase64(imageFile);
    console.log('✅ Image convertie, taille:', base64Image.length, 'caractères');
    
    // ✅ Appel via notre API Next.js (pas directement OpenAI)
    console.log('🌐 Appel API /api/ai/analyze...');
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        firstName: firstName,
        mode: 'photo'
      }),
      signal: signal  // ← Permet l'annulation + timeout
    });

    console.log('📡 Réponse API reçue, status:', response.status);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const recipeData = await response.json();
    console.log('✅ Données reçues:', recipeData);

    recipeData.steps = recipeData.steps.split('|').join('\n\n');

    // 🎉 Transformation du tableau en une seule chaîne avec des doubles sauts de ligne
    if (Array.isArray(recipeData.steps)) {
      recipeData.steps = recipeData.steps.join('\n\n');
    }

    console.log('🎉 Analyse photo terminée avec succès');
    return recipeData;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Timeout ou annulation');
      throw new Error('Analyse annulée');
    }
    console.error('💥 Erreur analyse photo:', error);
    throw new Error('Image non conforme essayez JPEG ou une copie d\'ecran');
  }
}

// 📝 ANALYSE RECETTE MANUSCRITE → RECETTE STRUCTURÉE (avec timeout)
async analyzeManuscriptToRecipe(
  imageFile: File, 
  firstName: string,
  signal?: AbortSignal  // ← Pour annuler
): Promise<{
  title: string;
  author: string;
  prepMinutes: number;
  servings: string;
  ingredients: string[];
  steps: string;
  confidence: number;
}> {
  console.log('🚀 Début analyzeManuscriptToRecipe');
  
  try {
    if (!this.apiKey) {
      throw new Error('Clé OpenAI non configurée. Ajoutez NEXT_PUBLIC_OPENAI_API_KEY dans vos variables d\'environnement.');
    }

    console.log('📸 Conversion image en base64...');
    const base64Image = await this.fileToBase64(imageFile);
    console.log('✅ Image convertie, taille:', base64Image.length, 'caractères');
    
    // ✅ Appel via notre API Next.js (pas directement OpenAI)
    console.log('🌐 Appel API /api/ai/analyze...');
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        firstName: firstName,
        mode: 'manuscript'
      }),
      signal: signal  // ← Permet l'annulation + timeout
    });

    console.log('📡 Réponse API reçue, status:', response.status);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const recipeData = await response.json();
    console.log('✅ Données reçues:', recipeData);

    recipeData.steps = recipeData.steps.split('|').join('\n\n');

    console.log('🎉 Analyse manuscrit terminée avec succès');
    return recipeData;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Timeout ou annulation');
      throw new Error('Analyse annulée');
    }
    console.error('💥 Erreur analyse manuscrit:', error);
    throw new Error('Impossible de lire cette recette manuscrite');
  }
}

    // 🛠️ HELPER : Convertir File en base64 (avec support HEIC)
    private async fileToBase64(file: File): Promise<string> {
      // 🔄 Conversion HEIC si nécessaire
      let processedFile = file;
      
      const isHEIC = 
        file.type === 'image/heic' || 
        file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');
      
      if (isHEIC) {
        console.log('🔄 Conversion HEIC pour IA...');
        try {
          const heic2any = (await import('heic2any')).default;
          
          const conversionPromise = heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
            multiple: true
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 15000);
          });
          
          const result = await Promise.race([conversionPromise, timeoutPromise]);
          const convertedBlob = Array.isArray(result) ? result[0] : result as Blob;
          
          processedFile = new File(
            [convertedBlob],
            file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
            { type: 'image/jpeg' }
          );
          
          console.log('✅ Conversion HEIC IA réussie');
        } catch (error: any) {
          console.error('❌ Erreur conversion HEIC:', error);
          throw new Error('HEIC_CONVERSION_FAILED');
        }
      }
      
      // Conversion en base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });
    }

  // 🧹 DÉDUPLICATION INTELLIGENTE DES INGRÉDIENTS
  async deduplicateIngredients(ingredients: string[]): Promise<string[]> {
    if (!ingredients || ingredients.length <= 1) {
      return ingredients || [];
    }

    try {
      console.log('🧹 Déduplication intelligente de', ingredients.length, 'ingrédients...');
      
      // ✅ Appel via notre API Next.js
      const response = await fetch('/api/ai/deduplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });

      if (!response.ok) {
        throw new Error('Erreur déduplication API');
      }

      const result = await response.json();
      console.log('✅ Déduplication : de', ingredients.length, 'à', result.ingredients.length, 'ingrédients');
      
      return result.ingredients;
      
    } catch (error) {
      console.error('❌ Erreur déduplication, fallback basique:', error);
      // Fallback : déduplication basique par Set
      return Array.from(new Set(ingredients));
    }
  }
} // ← Fermeture de la classe OpenAIService

// Instance singleton
export const openAIService = new OpenAIService();