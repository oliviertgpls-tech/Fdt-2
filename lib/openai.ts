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

  // 📷 ANALYSE PHOTO DE PLAT → RECETTE
  async analyzePhotoToRecipe(imageFile: File, firstName: string): Promise<{
    title: string;
    author: string;
    prepMinutes: number;
    servings: string;
    ingredients: string[];
    steps: string;
    confidence: number;
  }> {
    try {
      // Vérifier la clé API    
      if (!this.apiKey) {
        throw new Error('Clé OpenAI non configurée. Ajoutez NEXT_PUBLIC_OPENAI_API_KEY dans vos variables d\'environnement.');
      }

      // Convertir l'image en base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // ✅ Appel via notre API Next.js (pas directement OpenAI)
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          firstName: firstName,
          mode: 'photo'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const recipeData = await response.json();

      recipeData.steps = recipeData.steps.split('|').join('\n\n');

      // 🎉 Transformation du tableau en une seule chaîne avec des doubles sauts de ligne
      if (Array.isArray(recipeData.steps)) {
        recipeData.steps = recipeData.steps.join('\n\n');
      }

      return recipeData;
      
    } catch (error) {
      console.error('Erreur analyse photo:', error);
      throw new Error('Impossible d\'analyser cette image');
    }
  }

  // 📝 ANALYSE RECETTE MANUSCRITE → RECETTE STRUCTURÉE
  async analyzeManuscriptToRecipe(imageFile: File, firstName: string): Promise<{
    title: string;
    author: string;
    prepMinutes: number;
    servings: string;
    ingredients: string[];
    steps: string;
    confidence: number;
  }> {
    try {
      if (!this.apiKey) {
        throw new Error('Clé OpenAI non configurée. Ajoutez NEXT_PUBLIC_OPENAI_API_KEY dans vos variables d\'environnement.');
      }

      const base64Image = await this.fileToBase64(imageFile);
      
      // ✅ Appel via notre API Next.js (pas directement OpenAI)
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          firstName: firstName,
          mode: 'manuscript'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const recipeData = await response.json();

      recipeData.steps = recipeData.steps.split('|').join('\n\n');

      return recipeData;
      
    } catch (error) {
      console.error('Erreur analyse manuscrit:', error);
      throw new Error('Impossible de lire cette recette manuscrite');
    }
  }

  // 🛠️ HELPER : Convertir File en base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Enlever le préfixe "data:image/...;base64,"
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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