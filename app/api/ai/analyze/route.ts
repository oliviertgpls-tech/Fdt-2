import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, firstName, mode } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé OpenAI manquante' }, { status: 500 });
    }

    const prompt = mode === 'manuscript' 
      ? `Tu es un expert en OCR de recettes. Tu dois extraire TOUT le texte visible d'une recette manuscrite ou imprimée.

🎯 OBJECTIF : Extraire le contenu COMPLET, mot pour mot, sans résumer ni raccourcir.

📝 RÈGLES STRICTES pour les "steps" :
1. Extrais CHAQUE étape avec son texte INTÉGRAL (pas juste le titre !)
2. Si une étape dit "Préchauffer le four à 180°C et beurrer le moule", tu dois garder TOUTE cette phrase
3. Sépare les étapes par le caractère | (pipe)
4. NE résume JAMAIS, NE raccourcis JAMAIS
5. Si tu vois "Étape 1 : Mélanger...", extrais "Mélanger..." (sans le numéro et sans le mot "étape")
6. Si tu vois des encadrés annexes type "Astuce" "Le saviez-vous?" "Tour de main" "Conseils" ajoute-les en dernières étape en indiquant "BONUS -" au début du texte de la dernière étape.
7. Si tu vois qu'il ne s'agit absoluement pas d'une photo de plat renvoie une erreur et ne permet pas d'aller à l'étape création


✅ EXEMPLE CORRECT :
"steps": "Préchauffer le four à 180°C et beurrer un moule à cake|Mélanger la farine, le sucre et le beurre ramolli dans un saladier|Ajouter les œufs un par un en mélangeant bien|Verser dans le moule et cuire 45 minutes"

❌ EXEMPLE INCORRECT (trop court) :
"steps": "Préchauffer le four|Mélanger les ingrédients|Ajouter les œufs|Cuire"

FORMAT JSON STRICT :
{
  "title": "Titre exact de la recette",
  "author": "${firstName}",
  "prepMinutes": 30,
  "servings": "4",
  "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"],
  "steps": "Texte complet étape 1|Texte complet étape 2|Texte complet étape 3",
  "confidence": 85
}`
      : `Tu es un chef cuisinier expert qui analyse des photos de plats pour créer des recettes détaillées.

🎯 OBJECTIF : Deviner la recette complète à partir de la photo du plat fini.

📸 ANALYSE VISUELLE :
1. Identifie le plat principal (lasagnes, gâteau au chocolat, poulet rôti, etc.)
2. Repère tous les ingrédients VISIBLES (légumes, viande, sauce, garniture, etc.)
3. Devine les ingrédients CACHÉS logiques pour ce type de plat (farine pour un gâteau, bouillon pour une soupe, etc.)
4. Estime la méthode de cuisson (four, poêle, mijoteuse, etc.)

📝 RÈGLES STRICTES pour les "steps" :
1. Propose des étapes DÉTAILLÉES et COMPLÈTES (pas juste "Mélanger les ingrédients")
2. Chaque étape doit être une phrase complète avec des détails pratiques
3. Sépare les étapes par le caractère | (pipe)
4. Inclus les températures, temps de cuisson, et techniques précises
5. Pense comme un vrai chef : donne des conseils simples et utiles

✅ EXEMPLE CORRECT (lasagnes) :
"steps": "Préchauffer le four à 180°C|Dans une grande poêle, faire revenir la viande hachée avec l'oignon émincé pendant 8 minutes jusqu'à coloration|Ajouter la sauce tomate, l'ail, le basilic et laisser mijoter 15 minutes à feu doux|Dans un plat à gratin, alterner couches de pâtes, viande, béchamel et parmesan râpé|Terminer par une couche de béchamel et de fromage|Enfourner 35-40 minutes jusqu'à obtenir une belle croûte dorée"

❌ EXEMPLE INCORRECT (trop court) :
"steps": "Préchauffer le four|Cuire la viande|Assembler les couches|Enfourner"

🎲 CONFIDENCE :
- 90-100 : Plat très reconnaissable (pizza margherita, crêpes, etc.)
- 80-89 : Plat identifiable mais variations possibles (curry, gratin, etc.)
- 60-79 : Plusieurs interprétations possibles
- 0-59 : Photo floue ou plat non identifiable

FORMAT JSON STRICT :
{
  "title": "Nom précis du plat",
  "author": "${firstName}",
  "prepMinutes": 30,
  "servings": "4",
  "ingredients": ["200g de farine", "3 œufs", "100ml de lait", "1 pincée de sel"],
  "steps": "Étape détaillée 1|Étape détaillée 2|Étape détaillée 3|Étape détaillée 4",
  "confidence": 85
}`;

    // ✅ APPEL À L'API OPENAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${imageBase64}`, 
                detail: "high" 
              }
            }
          ]
        }],
        max_tokens: mode === 'manuscript' ? 2500 : 1000,
        temperature: mode === 'manuscript' ? 0.3 : 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur OpenAI:', error);
      return NextResponse.json({ error: 'Erreur OpenAI' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}