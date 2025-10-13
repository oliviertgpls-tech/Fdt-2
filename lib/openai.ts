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
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analysez cette photo de plat et créez une recette complète au format JSON.

INSTRUCTIONS :
- Identifiez le plat principal visible
- Estimez les ingrédients probables
- Proposez une méthode de préparation réaliste
- Donnez un niveau de confiance (0-100)
- CRUCIAL : Dans le champ "steps",  NE PAS numéroter les étapes, séparez OBLIGATOIREMENT chaque étape par le caractère de séparation |
- EXEMPLE steps valide : "Faire ceci|Faire cela|Finir"

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "title": "Nom du plat",
  "author": "${firstName}",
  "prepMinutes": 30,
  "servings": "4 personnes",
  "ingredients": ["ingrédient 1", "ingrédient 2", ...],
  "steps": "Première étape|Deuxième étape|Troisième étape",
  "confidence": 85
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Pas de réponse de l\'IA');
      }

      // Parser la réponse JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      const recipeData = JSON.parse(jsonMatch[0]);

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
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Lisez cette recette manuscrite et structurez-la au format JSON.

INSTRUCTIONS :
- Lisez tout le texte visible (titre, ingrédients, étapes)
- Extrayez et structurez les informations
- Corrigez l'orthographe si nécessaire
- Estimez temps et portions si non mentionnés
- CRUCIAL : Dans le champ "steps",  NE PAS numéroter les étapes, séparez OBLIGATOIREMENT chaque étape par le caractère de séparation |
- EXEMPLE steps valide : "Faire ceci|Faire cela|Finir"

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "title": "Titre de la recette",
  "author": "${firstName}",
  "prepMinutes": 30,
  "servings": "4 personnes",
  "ingredients": ["ingrédient 1", "ingrédient 2", ...],
  "steps": "Première étape|Deuxième étape|Troisième étape",
  "confidence": 90
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 1200,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Pas de réponse de l\'IA');
      }

      // Parser la réponse JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }

      const recipeData = JSON.parse(jsonMatch[0]);

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
    if (!this.apiKey) {
      console.warn('⚠️ Pas de clé OpenAI, déduplication basique seulement');
      return Array.from(new Set(ingredients));
    }

    if (ingredients.length <= 1) {
      return ingredients;
    }

    try {
      console.log('🧹 Déduplication intelligente de', ingredients.length, 'ingrédients...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Voici une liste d'ingrédients qui peut contenir des doublons sémantiques.

LISTE :
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

RÈGLES DE DÉDUPLICATION :
- Si 2 ingrédients désignent la même chose (ex: "200g de farine" et "farine"), ne garde QUE le plus précis
- Si un ingrédient est une variante d'un autre (ex: "une botte de coriandre" et "coriandre"), ne garde QUE la version complète
- Respecte l'ordre de priorité : les versions avec quantités sont meilleures que celles sans

RETOURNE UN JSON avec seulement la liste nettoyée :
{
  "ingredients": ["ingrédient 1", "ingrédient 2", ...]
}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Pas de réponse');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format invalide');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Déduplication : de', ingredients.length, 'à', result.ingredients.length, 'ingrédients');
      
      return result.ingredients;
      
    } catch (error) {
      console.error('❌ Erreur déduplication, fallback sur déduplication basique:', error);
      return Array.from(new Set(ingredients));
    }
  }
} // ← Fermeture de la classe OpenAIService

// Instance singleton
export const openAIService = new OpenAIService();