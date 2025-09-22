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
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY manquante dans les variables d\'environnement');
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
- CRUCIAL : Dans le champ "steps", séparez OBLIGATOIREMENT chaque étape par le caractère de séparation |
- EXEMPLE steps valide : "1. Faire ceci|2. Faire cela|3. Finir"

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
- CRUCIAL : Dans le champ "steps", séparez OBLIGATOIREMENT chaque étape par le caractère de séparation |
- EXEMPLE steps valide : "1. Faire ceci|2. Faire cela|3. Finir"

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

  // 💰 HELPER : Estimer le coût d'une analyse
  estimateAnalysisCost(imageSize: 'high' | 'low' = 'high'): number {
    // Prix approximatifs en euros
    return imageSize === 'high' ? 0.008 : 0.003;
  }
}

// Instance singleton
export const openAIService = new OpenAIService();
